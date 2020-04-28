import mongoose from 'mongoose';
import { GtConnectOptions } from '../interfaces';
import { isPromise, isFunction } from '../utils';
import { GtSchemaContainer } from '../store/schema-container';

enum MongooseConnectionReadyState {
  disconnected = 0,
  connected = 1,
  connecting = 2,
  disconnecting = 3,
}

const DEFAULT_CONNECT_OPTIONS: GtConnectOptions = {
  compileAt: 'immediate',
};

function isConnected(connection: mongoose.Connection) {
  return connection.readyState === MongooseConnectionReadyState.connected;
}

export class GtConnectionStore {
  static get(): GtConnectionStore {
    return gtConnectionStore || new GtConnectionStore();
  }

  private readonly connections = new Map<string, { connection: mongoose.Connection, options: GtConnectOptions }>();
  private readonly listeners = new Map<string, Set<() => (void | Promise<void>)>>();

  private constructor() { }

  getCompiler(connectionId?: string) {
    if (!connectionId) {
      return mongoose;
    } else {
      const conn = this.connections.get(connectionId);
      if (!conn) {
        throw new Error(`Unknown connection "${connectionId}"`);
      }
      return conn.connection;
    }
  }

  beforeCompile(container: GtSchemaContainer, connectionId?: string) {
    if (connectionId) {
      const conn = this.connections.get(connectionId);
      if (conn && conn.options && isFunction(conn.options.beforeCompile)) {
        conn.options.beforeCompile({
          target: container.target,
          schema: container.schema,
        });
      }
    }
  }

  /**
   * Checks if a connection is ready to build models.
   * If no `connectionId` provided it means the default connection is used which means it's always ready because
   * the default connection does not support deffered model compilation.
   */
  canBuild(connectionId?: string): boolean {
    if (connectionId) {
      const conn = this.connections.get(connectionId);
      if (conn) {
        switch (conn.options.compileAt) {
          case 'immediate':
            return true;
          case 'connected':
            return isConnected(conn.connection);
        }
      }
      // connection is unknown / not defined yet.
      return false;
    } else {
      // default...
      return true;
    }
  }

  whenReadyToBuild(connectionId: string, build: () => (void | Promise<void>)) {
    if (this.canBuild(connectionId)) {
      build();
    }

    if (!this.listeners.has(connectionId)) {
      this.listeners.set(connectionId, new Set<() => (void | Promise<void>)>());
    }
    this.listeners.get(connectionId).add(build);
  }

  async manage(connectionId: string,
               connectionFactory: () => (mongoose.Connection | Promise<mongoose.Connection>),
               connectOptions?: GtConnectOptions) {

    if (this.connections.has(connectionId)) {
      throw new Error(`Connection "${connectionId}" already defined`)
    }

    this.connections.set(connectionId, null);
    const promiser = new Promiser();

    try {
      const connection = await Promise.resolve(connectionFactory());
      this.manageConnection(promiser, connection, connectionId, connectOptions);
    } catch (err) {
      this.connections.delete(connectionId);
      promiser.reject(err);
    }

    return promiser.promise;
  }

  private manageConnection(promiser: Promiser, connection: mongoose.Connection, connectionId: string, connectOptions?: GtConnectOptions) {
    const options = { ...DEFAULT_CONNECT_OPTIONS, ...(connectOptions || {}) };
    this.connections.set(connectionId, { connection, options });

    // try notify to immediate listeners, if not, set listen to notify to connected listeners
    if (!this.notifyListeners(promiser, connectionId) && !isConnected(connection)) {
      connection.once('connected', () => this.notifyListeners(promiser, connectionId));
    }
    connection.once('close', () => {
      this.connections.delete(connectionId);
      this.listeners.delete(connectionId);
    });
  }

  private notifyListeners(promiser: Promiser, connectionId: string): boolean {
    if (this.canBuild(connectionId)) {
      const listeners = this.listeners.get(connectionId);
      if (listeners) {
        this.listeners.delete(connectionId);
        const asyncOps: Array<Promise<any>> = [];
        try {
          for (const l of listeners) {
            const result = l();
            if (isPromise(result)) {
              asyncOps.push(result);
            }
          }
        } catch (err) {
          promiser.reject(err);
          return;
        }
        if (asyncOps.length > 0) {
          Promise.all(asyncOps).then(promiser.resolve).catch(promiser.reject);
        } else {
          promiser.resolve();
        }
        return true;
      }
    }
    return false;
  }
}

class Promiser<T = unknown> { // tslint:disable-line: max-classes-per-file
  resolve: (value?: T) => void;
  reject: (reason?: any) => void;
  readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise( (res, rej) => { this.resolve = res; this.reject = rej; });
  }
}

export const gtConnectionStore: GtConnectionStore = GtConnectionStore.get();
