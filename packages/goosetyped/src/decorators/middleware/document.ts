import { gtSchemaStore } from '../../store';
import { MethodDecoratorOf } from '../../utils';

// Type files are not updated (at the moment of coding this)
interface LocalSchema {
  pre(hook: string | RegExp, options: { document?: boolean, query?: boolean }, fn: (...args: any[]) => any): any;
  post(hook: string | RegExp, options: { document?: boolean, query?: boolean }, fn: (...args: any[]) => any): any;
}

function createHookDecorator(stage: 'pre' | 'post', hook: 'init' | 'validate' | 'save' | 'remove' | 'deleteOne' | 'updateOne') {
  return (target: object, key: string, descriptor: PropertyDescriptor) => {
    const schema = gtSchemaStore.getCreate(target).schema as LocalSchema;
    if (stage === 'pre') {
      schema.pre(hook, { document: true, query: false }, descriptor.value);
    } else {
      schema.post(hook, { document: true, query: false }, descriptor.value);
    }
  };
}

export function GtInitHook(stage: 'pre' | 'post'): MethodDecoratorOf<never, void> {
  return createHookDecorator(stage, 'init');
}

export function GtValidateHook(stage: 'pre' | 'post'): MethodDecoratorOf<never, any> {
  return createHookDecorator(stage, 'validate');
}

export function GtSaveHook(stage: 'pre' | 'post'): MethodDecoratorOf<never, any> {
  return createHookDecorator(stage, 'save');
}

export function GtRemoveHook(stage: 'pre' | 'post'): MethodDecoratorOf<never, any> {
  return createHookDecorator(stage, 'remove');
}

export function GtUpdateOneHook(stage: 'pre' | 'post'): MethodDecoratorOf<never, any> {
  return createHookDecorator(stage, 'updateOne');
}

export function GtDeleteOneHook(stage: 'pre' | 'post'): MethodDecoratorOf<never, any> {
  return createHookDecorator(stage, 'deleteOne');
}
