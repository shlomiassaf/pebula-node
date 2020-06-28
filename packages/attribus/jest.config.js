require('dotenv').config({ path: `${__dirname}/.env` });

const additionalModulePathIgnorePatterns = [];
switch (process.env.ATTRIBUS_TEST) {
  case 'attribus':
    additionalModulePathIgnorePatterns.push('<rootDir>/tests/attribus-nestjs/.*');
    break;
  case 'nest':
    additionalModulePathIgnorePatterns.push('<rootDir>/tests/attribus/.*');
    break;
}

module.exports = {
  setupFiles: ['./jest-setup.ts'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '@pebula/(.*)': '<rootDir>/../$1'
  },
  rootDir: '.',
  testEnvironment: '<rootDir>/tests/__env/jest-service-bus-test-environment/index',
  testEnvironmentOptions: {
    envSetup: false,
    envTeardown: false,
  },
  testRegex: '\.spec.ts$',
  transform: {
    '^.+\\.(t)s$': 'ts-jest'
  },
  modulePathIgnorePatterns: ['<rootDir>/cjs/.*', '<rootDir>/node_modules/.*', ...additionalModulePathIgnorePatterns],
  // coverageDirectory: './.coverage',
  // collectCoverage: true,
}