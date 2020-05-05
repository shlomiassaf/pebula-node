import { SbServerOptions, SbSubscriberMetadataOptions, SbEmitterMetadataOptions, SbSubscriptionMetadataOptions } from '@pebula/nesbus';
import { SbConfigurator } from '../../../src/management/configurator';
import { createManagementClientAdapter } from '../../../src/management/adapters';
import { ConfigService } from '../../server/services/config-service';
import { createManagement, createLogger } from '../../server/init/service-bus-setup';
import { EMITTERS, SUBSCRIBERS } from '../../server/service-bus-test-entities';

export async function run() {
  const config = new ConfigService();

  const serverOptions: SbServerOptions = {
    client: null,
    management: createManagement(config.sbConnection().management, config),
    logger: createLogger('EnvTeardown'),
  };

  serverOptions.logger.log('Starting service bus environment testing teardown.');
  const managementClient = createManagementClientAdapter(serverOptions.management);
  const configurator = new SbConfigurator(managementClient, serverOptions);
  
  const entities = [...Object.values(EMITTERS), ...Object.values(SUBSCRIBERS)] as Array<SbSubscriberMetadataOptions | SbEmitterMetadataOptions>;
  const phase1: Array<Promise<any>> = [];
  for (const c of entities) {
    if (c.testEnvSetup && c.testEnvSetup.teardown) {
      switch (c.testEnvSetup.entity) {
        case 'queue':
          phase1.push(configurator.deleteQueue(c.name));
          break;
        case 'topic':
          phase1.push(configurator.deleteTopic(c.name));
          break;
        case 'subscription':
          phase1.push(configurator.deleteSubscription((c as SbSubscriptionMetadataOptions).topicName, c.name));
          break;
      }
    }
  }
  if (phase1.length) {
    await Promise.all(phase1);
  }
}
