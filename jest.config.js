const { defaults } = require('ts-jest/presets');

module.exports = {
  ...defaults,
  rootDir: './packages',
  moduleNameMapper: {
    '^@purser/core(.*)$': '<rootDir>/purser-core/src$1',
  },
};
