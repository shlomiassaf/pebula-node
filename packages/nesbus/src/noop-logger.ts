  // tslint:disable: no-empty
import { LoggerService } from '@nestjs/common';

export class NoopLogger implements LoggerService {

  static readonly shared = new NoopLogger();

  log(message: any, context?: string): any { }
  error(message: any, trace?: string, context?: string): any { }
  warn(message: any, context?: string): any { }
  debug(message: any, context?: string): any { }
  verbose(message: any, context?: string): any { }
}
