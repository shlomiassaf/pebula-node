export interface SbLogger {
  log(message: any, context?: string): any;
  error(message: any, trace?: string, context?: string): any;
  warn(message: any, context?: string): any;
  debug?(message: any, context?: string): any;
  verbose?(message: any, context?: string): any;
}

export class NoopLogger implements SbLogger {
  static readonly shared = new NoopLogger();

  log(message: any, context?: string): any { }
  error(message: any, trace?: string, context?: string): any { }
  warn(message: any, context?: string): any { }
  debug(message: any, context?: string): any { }
  verbose(message: any, context?: string): any { }
}
