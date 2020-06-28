import {
  SbSubscriberMetadata as _SbSubscriberMetadata,
  SbEmitterMetadata as _SbEmitterMetadata,
  MetadataTarget as _MetadataTarget,
} from './metadata-framework';
import {
  SbEmitterTypeMap as _SbEmitterTypeMap,
  SbSubscriberTypeMap as _SbSubscriberTypeMap
} from './interfaces';
import { SbDiscoveryService as _SbDiscoveryService } from './discovery';

export namespace Extensibility {
  export const SbSubscriberMetadata = _SbSubscriberMetadata;
  export type SbSubscriberMetadata<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> = _SbSubscriberMetadata<T>;

  export const SbEmitterMetadata = _SbEmitterMetadata;
  export type SbEmitterMetadata<T extends keyof SbEmitterTypeMap = keyof SbEmitterTypeMap> = _SbEmitterMetadata<T>;

  export const MetadataTarget = _MetadataTarget;
  export type MetadataTarget = _MetadataTarget;

  export type SbEmitterTypeMap = _SbEmitterTypeMap;
  export type SbSubscriberTypeMap = _SbSubscriberTypeMap;

  export const SbDiscoveryService = _SbDiscoveryService;
  export type SbDiscoveryService = _SbDiscoveryService;
}

