import { gtSchemaStore } from '../store';

export function GtLocalProp(): PropertyDecorator {
  return (target: object, key: string): void => {
    gtSchemaStore.getCreate(target).addLocalProp(key);
  };
}
