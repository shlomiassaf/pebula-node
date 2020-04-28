// tslint:disable: variable-name
import { SbServer } from '../server';
import { SbClient } from '../client';
import { SbChannelManager } from './channel-manager';

export class SbResourceGroup {

  get client(): SbClient | undefined { return this._client; }
  set client(value: SbClient) { this.sync(value, this._server); }

  get server(): SbServer | undefined { return this._server; }
  set server(value: SbServer) { this.sync(this._client, value); }

  channels = new SbChannelManager(this);

  private _client?: SbClient;
  private _server?: SbServer;

  constructor(public readonly id?: string) { }

  private sync(client?: SbClient, server?: SbServer): void {
    if (this._client === client && this._server === server) {
      return;
    }

    this._client = client;
    this._server = server;
    this.channels.resourceUpdate();
  }
}
