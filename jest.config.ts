import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: { global: { lines: 90 } }
};

export default config;
