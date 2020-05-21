import { MethodDecoratorOf } from '../utils';
import { decoratorStore } from '../store';
import {
  CaseCompleteEvent,
  SuiteStartEvent,
  SuiteAbortEvent,
  SuiteCompleteEvent,
  SuiteErrorEvent,
  SuiteResetEvent,
  TouchStoneStartEvent, TouchStoneEndEvent,
} from '../runner/events';

export interface NoopMetadataArgs { }

export const OnStart = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[SuiteStartEvent], boolean | void>>({ allowMulti: true, allowedTargets: ['method'] });
export const OnCaseComplete = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[CaseCompleteEvent], boolean | void>>({ allowMulti: true, allowedTargets: ['method'] });
export const OnAbort = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[SuiteAbortEvent], void>>({ allowMulti: true, allowedTargets: ['method'] });
export const OnError = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[SuiteErrorEvent], void>>({ allowMulti: true, allowedTargets: ['method'] });
export const OnReset = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[SuiteResetEvent], void>>({ allowMulti: true, allowedTargets: ['method'] });
export const OnComplete = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[SuiteCompleteEvent], boolean | void>>({ allowMulti: true, allowedTargets: ['method'] });

export const OnTouchStoneStart = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[TouchStoneStartEvent], any>>({ allowMulti: true, allowedTargets: ['method'] });
export const OnTouchStoneEnd = decoratorStore.createDecorator<NoopMetadataArgs, MethodDecoratorOf<[TouchStoneEndEvent], any>>({ allowMulti: true, allowedTargets: ['method'] });