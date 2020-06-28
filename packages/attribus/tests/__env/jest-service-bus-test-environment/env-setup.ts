import { SbServerOptions, SbSubscriberMetadataOptions, SbEmitterMetadataOptions, SbSubscriptionMetadataOptions } from '../../../src';
import { SbConfigurator } from '../../../src/management/configurator';
import { createManagementClientAdapter } from '../../../src/management/adapters';
import { ConfigService } from '../services/config-service';
import { createManagement, createLogger } from '../service-bus-setup';
import { EMITTERS, SUBSCRIBERS } from '../containers/service-bus-test-entities';

export async function run() {
  const config = new ConfigService();

  const serverOptions: SbServerOptions = {
    client: null,
    management: createManagement(config.sbConnection().management, config),
    logger: createLogger('EnvSetup'),
  };

  serverOptions.logger.log('Starting service bus environment testing setup.');
  const managementClient = createManagementClientAdapter(serverOptions.management);
  const configurator = new SbConfigurator(managementClient, serverOptions);
  
  const entities = [...Object.values(EMITTERS), ...Object.values(SUBSCRIBERS)] as Array<SbSubscriberMetadataOptions | SbEmitterMetadataOptions>;
  const phase1: Array<() => Promise<any>> = [];
  const phase2: Array<() => Promise<any>> = [];
  for (const c of entities) {
    if (c.testEnvSetup && c.testEnvSetup.setup) {
      switch (c.testEnvSetup.entity) {
        case 'queue':
          phase1.push(() => configurator.verifyQueue(c.name, 'verifyCreate'));
          break;
        case 'topic':
          phase1.push(() => configurator.verifyTopic(c.name, 'verifyCreate'));
          break;
        case 'subscription':
          phase2.push(() => configurator.verifySubscription((c as SbSubscriptionMetadataOptions).topicName, c.name, 'verifyCreate'));
          break;
      }
    }
  }
  if (phase1.length) {
    await Promise.all(phase1.map( fn => fn() ));
  }
  if (phase2.length) {
    await Promise.all(phase2.map( fn => fn() ));
  }
}

