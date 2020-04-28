import mongoose from 'mongoose';
import { Ctor } from '../utils/types';

export interface GtBeforeCompileModelHandler {
  target: Ctor<any>;
  schema: mongoose.Schema;
}

export interface GtConnectOptions {
  /**
   * When to compile the model.
   *
   * - immediate: When the connection object is resolved from the factory function (which does not necessarily mean it is connected)
   * - connected: When the connection status changes to connected (if the connection is already connected this is equivalent to "immediate")
   * @defaultValue immediate
   */
  compileAt?: 'immediate' | 'connected';

  /**
   * A handler invoked before compiling the model, providing the schema so you can perform final adjustments.
   */
  beforeCompile?: (handler: GtBeforeCompileModelHandler) => void;
}
