import { SbSubscriberMetadata, SbEmitterMetadata } from '../metadata';

export function resourceAlreadyExists(resourceType: 'client' | 'server', resourceName?: string): Error {
  const message = resourceName
    ? `A service bus ${resourceType} with the name ${resourceName} already exists`
    : `A default service bus ${resourceType} already exists`
  ;
  const err = new Error(message);
  err.name = resourceType === 'client' ? 'SbClientExists' : 'SbServerExists';
  return err;
}

export function missingEmitterResource(emitterMeta: SbEmitterMetadata): Error {
  const intro = emitterMeta.type === 'queue' ? `Queue Emitter` : `Topic Emitter`;
  const { name, clientId } = emitterMeta.metaOptions;

  const message = clientId
    ? `${intro} "${name}" has a reference to a missing service bus client ${clientId}`
    : `${intro} "${name}" has a reference to a missing default service bus client`
  ;
  const err = new Error(message);
  err.name = 'MissingEmitterResource';
  return err;
}

export function missingSubscriberResource(subscriberMeta: SbSubscriberMetadata): Error {
  const intro = subscriberMeta.type === 'queue' ? `Queue Subscriber` : `Topic Subscriber`;
  const { name, serverId } = subscriberMeta.metaOptions;

  const message = serverId
    ? `${intro} "${name}" has a reference to a missing service bus client ${serverId}`
    : `${intro} "${name}" has a reference to a missing default service bus client`
  ;
  const err = new Error(message);
  err.name = 'MissingSubscriberResource';
  return err;
}

export function invalidSubscriberDecoration(key: string | symbol, subscriberMeta: SbSubscriberMetadata): Error {
  const intro = subscriberMeta.type === 'queue' ? `Queue Subscriber` : `Topic Subscriber`;
  const { name } = subscriberMeta.metaOptions;

  const err = new Error(`${intro} "${name}" (prop: ${String(key)}) must decorate a property value which is a function (OperatorFunction<SbContext, SbContext>)`);
  err.name = 'InvalidSubscriberDecoration';
  return err;
}

export function invalidOrMissingConfiguration(name: string, msg: string): Error {
  const err = new Error(`Invalid configuration in "${name}": ${msg}`);
  err.name = 'SbInvalidOrMissingConfiguration';
  return err;
}

export function routeHandlerMissing(meta: SbSubscriberMetadata): Error {
  const err = new Error(`Could not find a route handler for type ${meta.type}`);
  err.name = 'SbRouteHandlerMissing';
  return err;
}
