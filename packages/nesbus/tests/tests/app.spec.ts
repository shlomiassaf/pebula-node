import { INestApplication, INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createSbServer } from '@pebula/nesbus';

import { NesBusTestModule, ServiceBusEmitClient, ServiceBusController, MessageStorage, ServiceBusEntityConfigurator } from '../server';
import { TestMessage } from '../test-utils';


describe('@pebula/nesbus', () => {
  // let app: INestMicroservice;
  let app: INestApplication;
  let serviceBusController: ServiceBusController;
  let serviceBusEmitClient: ServiceBusEmitClient;
  let msgStore: MessageStorage;

  beforeAll(async () => {
    jest.setTimeout(10000 * 30);

    const serviceBusEntityConfigurator = new ServiceBusEntityConfigurator('verifyCreate');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ NesBusTestModule ],
    })
    .overrideProvider(ServiceBusEntityConfigurator)
    .useValue(serviceBusEntityConfigurator)
    .compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({ strategy: createSbServer() });
    await app.startAllMicroservicesAsync();
    await app.listenAsync(4000);

    // app = moduleFixture.createNestMicroservice({ strategy: createSbServer() });
    // await app.listenAsync();

    msgStore = moduleFixture.get(MessageStorage);
    serviceBusController = moduleFixture.get(ServiceBusController);
    serviceBusEmitClient = moduleFixture.get(ServiceBusEmitClient);
  });

  beforeEach(() => {
    msgStore.reset();
  });

  it('/health (GET)', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue1.send(testMessage);
    const receivedMsgs = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsgs[0]);
  });

  afterAll(async () => {
    await app.close();
  });
});
