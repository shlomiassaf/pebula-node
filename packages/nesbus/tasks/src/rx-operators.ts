import { switchMap, filter } from 'rxjs/operators';
import { DeadLetterOptions } from '@azure/service-bus';
import { SbContext } from '@pebula/nesbus';

export const completeMessage = () => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getMessage().complete();
  return ctx;
});

export const abandonMessage = (propertiesToModify?: { [key: string]: any; }) => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getMessage().abandon(propertiesToModify);
  return ctx;
});

export const deferMessage = (propertiesToModify?: { [key: string]: any; }) => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getMessage().defer(propertiesToModify);
  return ctx;
});

export const deadLetter = (options?: DeadLetterOptions) => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getMessage().deadLetter(options);
  return ctx;
});

const alwaysBlock = filter( () => false );
export const block = () => alwaysBlock;
