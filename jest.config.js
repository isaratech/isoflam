/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    // esModuleInterop mirrors webpack's handling of CommonJS default imports (e.g. pathfinding)
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { esModuleInterop: true } }]
  },
  modulePaths: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    // Bundled by webpack as asset URLs
    '\\.(png|jpe?g|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$'
  ]
};
