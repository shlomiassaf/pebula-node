
process.env.MONGO_URL = 'mongodb://127.0.0.1';

module.exports = {
  setupFiles: ['./jest-setup.ts'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '@pebula/(.*)': '<rootDir>/../$1'
  },
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '\.spec.ts$',
  transform: {
    '^.+\\.(t)s$': 'ts-jest'
  },
  modulePathIgnorePatterns: ['<rootDir>/cjs/.*', '<rootDir>/node_modules/.*'],
  // coverageDirectory: './.coverage',
  // collectCoverage: true,
}