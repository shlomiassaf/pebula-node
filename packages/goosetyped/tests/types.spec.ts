// tslint:disable: max-classes-per-file
import {
  GtModel, GtResource,
  GtDocument, GtSubDocument,
  GtColumn, GtLocalProp,
  GtDiscriminatorKey, GtDiscriminatorType,
} from '../';

import { initMongoConnection, checkSubDocumentAfterCreate, checkDocumentAfterCreate } from './utils';
import { Ctor } from '../src/utils/types';

describe('E2E Tests', () => {
  initMongoConnection('diff');

  describe('Types', () => {

    it('should support the map type (primitives)', async () => {

      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({
          type: () => Number,
        })
        col: Map<string, number>;
      }

      const check = (doc: TestModel) => {
        expect(doc.col).toBeInstanceOf(Map);
        expect(doc.col.size).toBe(1);
        expect(doc.col.get('year')).toBe(2000);
      };

      check(await TestModel.create({ col: new Map([ ['year', 2000] ]) }));
      check(await TestModel.create({ col: { year: 2000 } }));
    });

    it('should support the map type (embedded)', async () => {
      @GtDocument()
      class OtherModel extends GtModel() {
        @GtColumn({})
        prop1: string;

        @GtLocalProp()
        token = String(Date.now());
      }

      @GtSubDocument()
      class OtherResource extends GtResource() {
        @GtColumn({})
        prop2: number;

        @GtLocalProp()
        token = String(Date.now());
      }

      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({
          type: () => OtherModel,
        })
        mapModel: Map<string, OtherModel>;

        @GtColumn({
          type: () => OtherResource,
        })
        mapResource: Map<string, OtherResource>;
      }

      const check = (map: Map<string, any>, mapKey: string, baseType: Ctor<any>, matchTo: any) => {
        expect(map).toBeInstanceOf(Map);
        expect(map.size).toBe(1);
        const value = map.get(mapKey);
        expect(value).toBeInstanceOf(baseType);
        checkSubDocumentAfterCreate(value, matchTo);
        expect(value.token).toBeTruthy();
      };

      const otherModelLike = { prop1: 'a' };
      const otherResourceLike = { prop2: 1 };

      let doc = await TestModel.create({
        mapModel: new Map<string, OtherModel | Partial<OtherModel>>([ ['a', new OtherModel(otherModelLike)] ]),
        mapResource: new Map<string, OtherResource | Partial<OtherResource>>([ ['a', new OtherResource(otherResourceLike)] ]),
      });

      check(doc.mapModel, 'a', OtherModel, otherModelLike);
      check(doc.mapResource, 'a', OtherResource, otherResourceLike);

      doc = await TestModel.create({
        mapModel: { a: new OtherModel(otherModelLike) },
        mapResource: { a: new OtherResource(otherResourceLike) },
      });

      check(doc.mapModel, 'a', OtherModel, otherModelLike);
      check(doc.mapResource, 'a', OtherResource, otherResourceLike);

      doc = await TestModel.create({
        mapModel: { a: otherModelLike },
        mapResource: { a: otherResourceLike },
      });

      check(doc.mapModel, 'a', OtherModel, otherModelLike);
      check(doc.mapResource, 'a', OtherResource, otherResourceLike);
    });

    it('should support the map type (embedded - discriminator)', async () => {
      @GtDocument()
      class BaseModel extends GtModel() {
        @GtDiscriminatorKey()
        kind: string;

        @GtLocalProp()
        token = String(Date.now());
      }

      @GtDocument()
      @GtDiscriminatorType()
      class P1Model extends BaseModel {
        @GtColumn({})
        prop1: string = 'prop1';

        @GtColumn({})
        val1: string;
      }

      @GtDocument()
      @GtDiscriminatorType()
      class P2Model extends BaseModel {
        @GtColumn({})
        prop2: string = 'prop2';

        @GtColumn({})
        val2: string;
      }

      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({
          type: () => BaseModel,
        })
        mapModel: Map<string, BaseModel>;
      }

      const check = (map: Map<string, any>, mapKey: string, baseType: Ctor<any>, matchTo: any) => {
        expect(map).toBeInstanceOf(Map);
        const value = map.get(mapKey);
        expect(value).toBeInstanceOf(baseType);
        checkSubDocumentAfterCreate(value, matchTo);
        expect(value.token).toBeTruthy();
      };

      const p1ModelLike = { val1: 'val1' };
      const p2ModelLike = { val2: 'val2' };

      let doc = await TestModel.create({
        mapModel: new Map<string, BaseModel | Partial<BaseModel>>([
          ['p1', new P1Model(p1ModelLike)],
          ['p2', new P2Model(p2ModelLike)],
        ]),
      });

      check(doc.mapModel, 'p1', P1Model, p1ModelLike);
      check(doc.mapModel, 'p2', P2Model, p2ModelLike);

      doc = await TestModel.create({
        mapModel: { p1: new P1Model(p1ModelLike), p2: new P2Model(p2ModelLike) },
      });

      check(doc.mapModel, 'p1', P1Model, p1ModelLike);
      check(doc.mapModel, 'p2', P2Model, p2ModelLike);

      doc = await TestModel.create({
        mapModel: {
          p1: { ...p1ModelLike, kind: 'P1Model' },
          p2: { ...p2ModelLike, kind: 'P2Model' },
        },
      });

      check(doc.mapModel, 'p1', P1Model, p1ModelLike);
      check(doc.mapModel, 'p2', P2Model, p2ModelLike);
    });

  });
});
