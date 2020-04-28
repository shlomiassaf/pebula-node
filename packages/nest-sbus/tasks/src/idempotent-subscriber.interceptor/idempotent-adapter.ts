import { SbContext } from '@pebula/nest-sbus';

export abstract class IdempotentAdapter {
  abstract async isIdempotent(ctx: SbContext): Promise<boolean>;
  abstract async create(ctx: SbContext): Promise<any>;
  abstract async find(ctx: SbContext): Promise<any>;
}