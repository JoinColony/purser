const { defaults } = require('ts-jest/presets');

module.exports = {
  ...defaults,
  rootDir: './packages/@purser',
  moduleNameMapper: {
    '^@purser/core(.*)$': '<rootDir>/core/src$1',
  },
};
