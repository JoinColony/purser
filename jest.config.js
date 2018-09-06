module.exports = {
  rootDir: '.',
  roots: [
    '<rootDir>/modules/node_modules/@colony',
    '<rootDir>/tests/',
  ],
  testPathIgnorePatterns: [
    'node_modules',
    'modules',
    'docs',
    'scripts',
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules',
    '!<rootDir/modules/node_modules>',
  ],
  moduleNameMapper: {
    '^@colony/purser-core/(.*)$': '<rootDir>/modules/node_modules/@colony/purser-core/src/$1',
  },
};
