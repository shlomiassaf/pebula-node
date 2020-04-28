import mongoose from 'mongoose';
import { gtConnectionStore } from './connection-store';
import { GtConnectOptions } from '../interfaces';

/**
 * Registers a connection with GooseTyped to be used to compile Models registered under the same connection Id. 
 * @param connectionId A unique id for this connection, will be used to find models with matching connectionId's.
 * @param connectionFactory A function that returns a mongoose connection or a Promise for a mongoose connection.
 * The connection does not have to be alive.
 */
export function addConnection(connectionId: string,
                              connectionFactory: () => (mongoose.Connection | Promise<mongoose.Connection>),
                              connectOptions?: GtConnectOptions) {
  return gtConnectionStore.manage(connectionId, connectionFactory, connectOptions);
}
