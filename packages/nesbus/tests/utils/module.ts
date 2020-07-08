import { isFunction } from 'util';
import { Test, TestingModule } from '@nestjs/testing';
import { createSbServer } from '@pebula/nesbus';

import { ModuleMetadata, Provider } from '@nestjs/common/interfaces';
import { NestBusSharedModule,  createServiceBusModule } from '../server';

export class TestModuleFactory {

  static create(): Pick<TestModuleFactory, 'addServiceBusModule' | 'addMetadata'> {
    return new TestModuleFactory();
  }

  private moduleMetadata: ModuleMetadata = {
    imports: [ NestBusSharedModule ],
    controllers: [],
    providers: [ ],
    exports: [],
  };

  private fn?: (testingModule: TestingModule) => {};

  private constructor() { }

  addServiceBusModule(...providers: Provider[]): Pick<TestModuleFactory, 'compile' | 'addMetadata'> {
    const serviceBusModule = createServiceBusModule(...providers);
    this.moduleMetadata.imports.push(serviceBusModule);
    return this;
  }

  addMetadata(moduleMetadata: ModuleMetadata, overwrite = false): this {
    for (const [key, value] of Object.entries(moduleMetadata)) {
      if (overwrite) {
        this.moduleMetadata[key as keyof ModuleMetadata] = value;
      } else {
        this.moduleMetadata[key as keyof ModuleMetadata].push(...value);
      }
    }
    return this;
  }


  compile(fn?: (testingModule: TestingModule) => {}): Pick<TestModuleFactory, 'init'> {
    this.fn = fn;
    return this;
  }

  async init(port = 4000) {
    const moduleBuilder = Test.createTestingModule(this.moduleMetadata);
    const testingModule = await moduleBuilder.compile();
    if (isFunction(this.fn)) {
      this.fn(testingModule);
    }
    const app = testingModule.createNestApplication();
    app.connectMicroservice({ strategy: createSbServer() });
    await app.startAllMicroservicesAsync();
    await app.listenAsync(port);

    // app = moduleFixture.createNestMicroservice({ strategy: createSbServer() });
    // await app.listenAsync();

    return app;
  }
}
