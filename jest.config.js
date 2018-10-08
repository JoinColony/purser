module.exports = {
  rootDir: '.',
  testPathIgnorePatterns: [
    '<rootDir>/tests',
    '!<rootDir>/node_modules',
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules',
    '!<rootDir>/modules/node_modules',
  ],
  moduleNameMapper: {
    '^@mocks/(.*)$': '<rootDir>/modules/tests/mocks/@colony/$1',
    '^ethers/wallet$': '<rootDir>/modules/tests/mocks/ethers/wallet/index.js',
    '^ethers/utils$': '<rootDir>/modules/tests/mocks/ethers/utils/index.js',
    '^ethers/utils/secret-storage$': '<rootDir>/modules/tests/mocks/ethers/utils/secret-storage.js',
    '^@ledgerhq/hw-transport-u2f$': '<rootDir>/modules/tests/mocks/ledger-hw-transport-u2f.js',
    '^@ledgerhq/hw-app-eth$': '<rootDir>/modules/tests/mocks/ledger-hw-app-eth.js',
    '^ethereumjs-tx$': '<rootDir>/modules/tests/mocks/ethereumjs-tx.js',
    '^ethereumjs-util$': '<rootDir>/modules/tests/mocks/ethereumjs-util.js',
    '^bip32-path$': '<rootDir>/modules/tests/mocks/bip32-path.js',
    '^hdkey$': '<rootDir>/modules/tests/mocks/hdkey.js',
  },
};
