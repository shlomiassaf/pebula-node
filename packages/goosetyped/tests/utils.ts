import mongoose from 'mongoose';

export const initMongoConnection = (cleanModelsStrategy?: 'diff' | 'all') => {
  let modelsNames: string[];
  let connection: typeof mongoose;

  beforeAll(async () => {
    try {
      connection = await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

  switch (cleanModelsStrategy) {
    case 'all':
    case 'diff':
      beforeEach(() => {
        modelsNames = cleanModelsStrategy === 'diff' ? Object.keys(connection.models) : [];
      });
      afterEach(() => {
        for (const key of Object.keys(connection.models)) {
          if (modelsNames.indexOf(key) === -1) {
            delete connection.models[key];
            delete connection.modelNames[key];
          }
        }
      });
      break;
  }

  afterAll(async () => {
    await connection.connection.close();
  });
};

export function checkDocumentAfterCreate<T extends mongoose.Document = mongoose.Document>(model: T, expectedData: Partial<T>) {
  expect(model._id).toBeDefined();
  checkSubDocumentAfterCreate(model, expectedData);
}

export function checkSubDocumentAfterCreate<T = any>(model: T, expectedData: Partial<T>, prefix = '') {
  for (const [key, value] of Object.entries(expectedData)) {
    if (typeof value === 'object') {
      if (model[key] !== value) {
        checkSubDocumentAfterCreate(model[key], value, prefix + key + '.');
      }
    } else {
      if (model[key] !== value) {
        console.warn(prefix + key);
      }
      expect(model[key]).toEqual(value);
    }
  }
}
