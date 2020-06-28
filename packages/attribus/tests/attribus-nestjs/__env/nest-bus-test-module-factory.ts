import { isFunction } from 'util';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createServiceBusStrategy, SbModuleRegisterOptions } from '@pebula/attribus/nestjs';

import { createServiceBusModule } from './create-service-bus-module';
import { NestBusSharedModule } from './nest-bus-shared.module';

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

  addServiceBusModule(moduleMetadata: ModuleMetadata = {},
                      opts?: Pick<SbModuleRegisterOptions, 'metadataTransformer' | 'providers'>): Pick<TestModuleFactory, 'compile' | 'addMetadata'> {
    const serviceBus = createServiceBusModule(moduleMetadata, opts);
    this.moduleMetadata.imports.push(...serviceBus.imports);
    this.moduleMetadata.providers.push(...(serviceBus.providers || []));
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
    app.connectMicroservice({ strategy: createServiceBusStrategy() });
    await app.startAllMicroservicesAsync();
    await app.listenAsync(port);

    // app = moduleFixture.createNestMicroservice({ strategy: createSbServer() });
    // await app.listenAsync();

    return app;
  }
}
