module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: { global: { lines: 90 } },
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
}
