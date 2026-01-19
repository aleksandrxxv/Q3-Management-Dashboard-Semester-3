import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/tests'], // Ensure Jest searches the right paths
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Use node environment for performance tests (they need real fetch)
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
};

export default config;
