import { OperatorFunction } from 'rxjs';
import { Sender } from '@azure/service-bus';
import { SbContext, Extensibility, Ctor } from '@pebula/attribus';
import { globalMetadataStore } from '../../../src/metadata-framework/metadata-store';
import { getBaseClass } from '../../../src/utils/proto';
import { EntityManager, QueueEntityManager, TopicEntityManager, SubscriptionEntityManager } from './entity-manager';
import { ServiceBusAtomManagementClient } from '../../../src/atom-adapter/atom-client/src/serviceBusAtomManagementClient';
import { MessageCountDetails } from '../../../src/atom-adapter/atom-client/src/util/utils';

const METADATA_CACHE = new Map<Sender | OperatorFunction<SbContext, any> | ( (...args: []) => any), [string | symbol, Extensibility.SbSubscriberMetadata | Extensibility.SbEmitterMetadata]>();
const ENTITY_MANAGER_CACHE = new Map<any, EntityManager>();

export class ManagementUtils {

  constructor(private readonly containers: any[], private managementClient: ServiceBusAtomManagementClient) {  }

  entityManager<T extends 'queue' | 'topic' = null>(value: Sender): T extends null ? EntityManager : T extends 'topic' ? TopicEntityManager : T extends 'queue' ? QueueEntityManager : never;
  entityManager<T extends 'queue' | 'subscription' = null>(value: OperatorFunction<SbContext, any> | ( (...args: []) => any) ): T extends null ? EntityManager : T extends 'subscription' ? SubscriptionEntityManager : T extends 'queue' ? QueueEntityManager : never;
  entityManager(value: Sender | OperatorFunction<SbContext, any> | ( (...args: []) => any) ): EntityManager {
    if (!ENTITY_MANAGER_CACHE.has(value)) {
      const [ key, metadata ] = this.findMetadata(value as any);
      ENTITY_MANAGER_CACHE.set(value, EntityManager.create(metadata, this.managementClient));
    }
    return ENTITY_MANAGER_CACHE.get(value);   
  }

  async verifyMessageCountUnchanged(entityManager: EntityManager, ...compareKeys: Array<keyof MessageCountDetails>) {
    const count = await entityManager.getMessageCountDetails();
    return async () => {
      const count2 = await entityManager.getMessageCountDetails();
      if (compareKeys.length === 0) {
        compareKeys.push( ...Object.keys(count).filter(k => k.endsWith('Count')) as any );
      }
      for (const key of compareKeys) {
        expect(count[key]).toEqual(count2[key]);  
      }
    }
  }

  private findMetadata(value: Sender): [string | symbol, Extensibility.SbEmitterMetadata];
  private findMetadata(value: OperatorFunction<SbContext, any> | ( (...args: []) => any) ): [string | symbol, Extensibility.SbSubscriberMetadata];
  private findMetadata(value: Sender | OperatorFunction<SbContext, any> | ( (...args: []) => any) ): [string | symbol, Extensibility.SbSubscriberMetadata | Extensibility.SbEmitterMetadata] {
    if (!METADATA_CACHE.has(value)) {
      for (const instance of this.containers) {
        const metadata = tryGetTargetMetadata(instance.constructor);
        if (value instanceof Sender) {
          for (const [k, v] of metadata.getEmitters()) {
            if (instance[k] === value) {
              METADATA_CACHE.set(value, [k, v]);
              break;
            }
          }
        } else {
          for (const [k, v] of metadata.getSubscriptions()) {
            if (instance[k] === value) {
              METADATA_CACHE.set(value, [k, v]);
              break;
            }
          }
        }
      }
    }
    return METADATA_CACHE.get(value);
  }
}

function tryGetTargetMetadata(ctor: Ctor<any>) {
  while (ctor) {
    const metadata = globalMetadataStore.get(ctor);
    if (metadata) {
      return metadata;
    }
    ctor = getBaseClass(ctor) as any;
  }
}