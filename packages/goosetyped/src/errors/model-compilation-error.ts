import { GtSchemaContainer } from '../store/schema-container';
import { GtDocumentMetadata } from '../metadata';
import { Ctor } from '../utils/types';

export class GtModelCompilationError extends Error {

  static create(container: GtSchemaContainer, internalError: Error) {
    while (true) {
      if (internalError instanceof GtModelCompilationError) {
        if (internalError.internalError instanceof GtModelCompilationError) {
          internalError = internalError.internalError;
        } else {
          return internalError;
        }
      } else {
        return new GtModelCompilationError(container, internalError);
      }
    }
  }

  public readonly target: Ctor<any>;
  public readonly modelName: string;
  public readonly connectionId?: string;

  constructor(container: GtSchemaContainer, public readonly internalError: Error) {
    super();
    this.modelName = container.getName();
    this.connectionId = (container.schemaMetadata as GtDocumentMetadata).connectionId;
    this.message = `Error compiling model ${this.modelName} [Connection: ${this.connectionId || 'Default'}]`;

    this.target = container.target;
  }
 
}
