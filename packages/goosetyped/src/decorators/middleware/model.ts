import { gtSchemaStore } from '../../store';
import { StaticMethodDecoratorOf } from '../../utils';

// Type files are not updated (at the moment of coding this)
interface LocalSchema {
  pre(hook: string | RegExp, options: { document?: boolean, query?: boolean }, fn: (...args: any[]) => any): any;
  post(hook: string | RegExp, options: { document?: boolean, query?: boolean }, fn: (...args: any[]) => any): any;
}

function createHookDecorator(stage: 'pre' | 'post', hook: 'insertMany') {
  return (target: object, key: string, descriptor: PropertyDescriptor) => {
    gtSchemaStore.getCreate(target).addHook(stage, hook, {}, descriptor.value);
  };
}

export function GtInsertManyHook(stage: 'post'): StaticMethodDecoratorOf<[any[]], any>;
export function GtInsertManyHook(stage: 'pre'): StaticMethodDecoratorOf<never, any>;
export function GtInsertManyHook(stage: 'pre' | 'post'): StaticMethodDecoratorOf<never, any> {
  return createHookDecorator(stage, 'insertMany');
}
