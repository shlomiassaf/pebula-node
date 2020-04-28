import { SbServer } from './server';
import { sbResourceManager } from './resource-manager';

/**
 * Create or returns and existing server.
 *
 * This is for use on the `strategy` property option when creating a microservice.
 */
export function createSbServer(serverId?: string): SbServer {
  return sbResourceManager.getServer(serverId) || sbResourceManager.createServer(serverId);
}
