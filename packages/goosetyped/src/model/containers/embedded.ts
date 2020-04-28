import { Ctor } from '../../utils';
import { GtSchemaContainer } from '../../store';
import { EmbeddedDocumentStatic, CoreDocumentArray } from '../../mongoose.extend';
import { SCHEMA_CONTAINER } from './symbol';

export function extendEmbeddedDocument(EmbeddedDoc: EmbeddedDocumentStatic<any>) {
  return class GtEmbeddedDocument<T = any> extends EmbeddedDoc {
    constructor(obj: T, parentArr: CoreDocumentArray<any>, skipId: boolean, fields: any, index: number) {
      super(parentArr ? {} : obj, parentArr, skipId, fields, index);
      if (parentArr) {
        const container: GtSchemaContainer = parentArr.$schema()[SCHEMA_CONTAINER];
        container.localInfo.processEmbeddedArrayItemModelInstance(this, obj);
      }
    }
  };
}
