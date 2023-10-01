import { switchMap, filter } from 'rxjs/operators';
import { DeadLetterOptions } from '@azure/service-bus';
import { SbContext } from '@pebula/nesbus';

export const completeMessage = () => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getReceiver().completeMessage(ctx.getMessage());
  return ctx;
});

export const abandonMessage = (propertiesToModify?: { [key: string]: any; }) => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getReceiver().abandonMessage(ctx.getMessage(), propertiesToModify);
  return ctx;
});

export const deferMessage = (propertiesToModify?: { [key: string]: any; }) => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getReceiver().deferMessage(ctx.getMessage(), propertiesToModify);
  return ctx;
});

export const deadLetter = (options?: DeadLetterOptions & {[key: string]: any }) => switchMap( async <T extends SbContext>(ctx: T) => {
  await ctx.getReceiver().deadLetterMessage(ctx.getMessage(), options);
  return ctx;
});

const alwaysBlock = filter( () => false );
export const block = () => alwaysBlock;
