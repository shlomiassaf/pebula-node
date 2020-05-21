// tslint:disable: max-classes-per-file
import { Cls, Ctor } from '../utils';
import { extendDecoratorMetadata } from './decorator-store';

function mixObjects(base: any, mixins: any[]): void {
  mixins.forEach(mixin => {
    Object.getOwnPropertyNames(mixin)
      .concat(Object.getOwnPropertySymbols(mixin) as any)
      .forEach(name => {
        // mixin can't override base behavior, only add
        if (!base.hasOwnProperty(name)) {
          // if its a property descriptor we need to rewire the context
          const propDesc = Object.getOwnPropertyDescriptor(mixin, name);
          if (propDesc) {
            Object.defineProperty(base, name, propDesc);
          } else {
            base[name] = mixin[name];
          }
        }
      });
  });
}

export function Mixin<T1, C1>(m1: C1 & Cls<T1>): Ctor<T1> & C1;
export function Mixin<T1, C1, T2, C2>(m1: C1 & Cls<T1>, m2: C2 & Cls<T2>): Ctor<T1 & T2> & C1 & C2;
export function Mixin<T1, C1, T2, C2, T3, C3>(m1: C1 & Cls<T1>, m2: C2 & Cls<T2>, m3: C3 & Cls<T3>): Ctor<T1 & T2 & T3> & C1 & C2 & C3;
export function Mixin<T1, C1, T2, C2, T3, C3, T4, C4>(m1: C1 & Cls<T1>, m2: C2 & Cls<T2>, m3: C3 & Cls<T3>, m4: C4 & Cls<T4>): Ctor<T1 & T2 & T3 & T4> & C1 & C2 & C3 & C4;
export function Mixin<T1, C1, T2, C2, T3, C3, T4, C4, T5, C5>(m1: C1 & Cls<T1>, m2: C2 & Cls<T2>, m3: C3 & Cls<T3>, m4: C4 & Cls<T4>, m5: C5 & Cls<T5>): Ctor<T1 & T2 & T3 & T4 & T5> & C1 & C2 & C3 & C4 & C5;
export function Mixin<T1, C1, T2, C2, T3, C3, T4, C4, T5, C5>(m1: C1 & Cls<T1>, m2: C2 & Cls<T2>, m3: C3 & Cls<T3>, m4: C4 & Cls<T4>, m5: C5 & Cls<T5>, ...mn: Array<Cls<any>>): Ctor<T1 & T2 & T3 & T4 & T5> & C1 & C2 & C3 & C4 & C5;
export function Mixin(...mixins: Array<Cls<any>>): Ctor<any>;
export function Mixin<TMIXIN, CMIXIN>(...mixins: Array<CMIXIN & Cls<TMIXIN>>): Ctor<TMIXIN> & CMIXIN {

  class GtModelContainer { }

  if (mixins.length > 0) {
    mixObjects(GtModelContainer.prototype, mixins.map(m => m.prototype));
    mixObjects(GtModelContainer, mixins);
  }

  for (const mixin of mixins) {
    extendDecoratorMetadata(mixin, GtModelContainer);
  }

  return GtModelContainer as any;
}
