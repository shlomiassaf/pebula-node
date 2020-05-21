import '../../src/index';
import { ClassDecoratorOf, Ctor, DecoratorArgs } from '../../src/utils';
import { DecoratorOptions, DecorationTargetContainer, Decorator, DecoratorStore } from '../../src/decoration';

export class TestTargetContainer extends DecorationTargetContainer {
  static create(target: Ctor<any>) {
    return new TestTargetContainer(target);
  }

  addMetadata<T>(decor: Decorator, decoratorArgs: DecoratorArgs, metadata: T) {
    const metaInfos = this.metadata.get(decor) || [];

    if (metaInfos.length === 0) {
      this.metadata.set(decor, metaInfos);
    }
    metaInfos.push( { metadata: (metadata) as any, decoratorArgs });
  }

  getMetadata() {
    return this.metadata;
  }
}


describe('touchstone', () => {
  describe('decorator-store', () => {

    let store: DecoratorStore<TestTargetContainer>;

    beforeEach(() => {
      store = new DecoratorStore(TestTargetContainer);
    });

    it('should create a decorator and reflect if it exists', () => {
      interface TestMetadataArgs {
        name: string;
      }     
      const Test = store.createDecorator<TestMetadataArgs, ClassDecoratorOf<any, any>>({ allowedTargets: ['class'] });
      expect(store.exists(Test));
    });

    it('should create a decorator and reflect if it exists', () => {
      const TestClass = store.createDecorator<any, ClassDecorator>({});
      const TestMethod = store.createDecorator<any, MethodDecorator>({ allowMulti: true });
      const TestProp = store.createDecorator<any, PropertyDecorator>({});

      const classMeta = {};
      const methodMeta = {};
      const propMeta = {};
      @TestClass(classMeta)
      class MyTestClass {
        @TestProp(propMeta) myProp: string;

        @TestMethod(methodMeta) myMethod() {}
        @TestMethod(methodMeta) myMethod2() {}
      }

      const metadata = Array.from(store.getTargets())[0].getMetadata();
      expect(metadata.get(TestClass).length).toBe(1);
      expect(metadata.get(TestClass)[0].decoratorArgs.target).toBe(MyTestClass);
      expect(metadata.get(TestClass)[0].metadata).toBe(classMeta);

      expect(metadata.get(TestProp).length).toBe(1);
      expect(metadata.get(TestProp)[0].decoratorArgs.target).toBe(MyTestClass.prototype);
      expect(metadata.get(TestProp)[0].decoratorArgs['key']).toBe('myProp');
      expect(metadata.get(TestProp)[0].metadata).toBe(propMeta);

      expect(metadata.get(TestMethod).length).toBe(2);
      expect(metadata.get(TestMethod)[0].decoratorArgs.target).toBe(MyTestClass.prototype);
      expect(metadata.get(TestMethod)[0].decoratorArgs['key']).toBe('myMethod');
      expect(metadata.get(TestMethod)[0].decoratorArgs['descriptor'].value).toBe(MyTestClass.prototype.myMethod);
      expect(metadata.get(TestMethod)[0].metadata).toBe(methodMeta);

      expect(metadata.get(TestMethod)[1].decoratorArgs.target).toBe(MyTestClass.prototype);
      expect(metadata.get(TestMethod)[1].decoratorArgs['key']).toBe('myMethod2');
      expect(metadata.get(TestMethod)[1].decoratorArgs['descriptor'].value).toBe(MyTestClass.prototype.myMethod2);
      expect(metadata.get(TestMethod)[1].metadata).toBe(methodMeta);
    });

    it('should register the decorator options', () => {
      interface TestMetadataArgs {
        name: string;
      }
      
      const decoratorOptions: DecoratorOptions = { allowedTargets: ['class'] };
      const Test = store.createDecorator<TestMetadataArgs, ClassDecoratorOf<any, any>>(decoratorOptions);
      expect(store.getOptions(Test)).toBe(decoratorOptions);
    });

    it('should validate decorator options', () => {
      interface TestMetadataArgs {
        name: string;
      }
      
      const decoratorOptions: DecoratorOptions = { name: 'MyDecorator', allowedTargets: ['class'] };
      const Test = store.createDecorator<TestMetadataArgs, any>(decoratorOptions);

      const createClass = () => {
        class MyTestClass  {
          @Test()
          method() {}
        }
      }

      expect(createClass).toThrowError('Decorator MyDecorator can not be applied on a method, only on class');
    });
  })
});