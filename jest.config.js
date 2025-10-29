module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts', 'jest-canvas-mock', 'fake-indexeddb/auto'],
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',

    // Ignore untestable files.
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.model.ts',
    '!src/**/*.mocks.{ts,tsx}',
    '!src/client/domain/graphql.ts',

    // Ignore files covered by Cypress.
    '!src/**/*.layout.{ts,tsx}',
    '!src/**/*.page.{ts,tsx}',

    // Ignore root application files.
    '!src/client/app.tsx',
    '!src/client/client.tsx',
    '!src/server/app.server.ts',

    // Ignore dependencies.
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    // Because there is no way to compile the test files with webpack, we need to mimic the transient `@...` imports
    // here. These should only include .ts file imports. Non .ts files are handled explicitly below.
    '^@client(.*)$': '<rootDir>/src/client/domain$1',
    '^@graphql(.*)$': '<rootDir>/src/graphql-codegen.ts',
    '^@server(.*)$': '<rootDir>/src/server/domain$1',
    '^@test/client(.*)$': '<rootDir>/src/client/test$1',
    '^@test/server(.*)$': '<rootDir>/src/server/test$1',

    // When the tests encounter an image import, use the file mock instead.
    '\\.(png|svg|jpg|gif)$': '<rootDir>/test/mock-file.ts',
  },
};
