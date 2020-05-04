export * from './entity-provision';
export * from './credentials';
export * from './options';
export * from './subscriber-routing';
export * from './emitter';
export * from './subscriber';
export * from './interceptor';
export * from './module-register-options';
export * from './management';

export type MetaOrMetaFactory<T> = T | ( (helper?: any) => (T | Promise<T>));
