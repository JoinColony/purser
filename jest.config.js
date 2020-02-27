const { defaults } = require('ts-jest/presets');

module.exports = {
  ...defaults,
  rootDir: '.',
  // testPathIgnorePatterns: [
  //   '<rootDir>/tests',
  //   '!<rootDir>/node_modules',
  // ],
  // transformIgnorePatterns: [
  //   '<rootDir>/node_modules',
  //   '!<rootDir>/modules/node_modules',
  // ],
  moduleNameMapper: {
    '^@purser/core(.*)$': '<rootDir>/packages/purser-core/src$1',
    '^ethers/wallet$': '<rootDir>/modules/tests/mocks/ethers/wallet/index.js',
    '^ethers/utils$': '<rootDir>/packages/__mocks__/ethers/utils/index.ts',
    '^ethers/utils/secret-storage$': '<rootDir>/modules/tests/mocks/ethers/utils/secret-storage.js',
    '^ethers/utils/hdnode$': '<rootDir>/modules/tests/mocks/ethers/utils/hdnode.js',
    '^ethers/utils/json-wallet': '<rootDir>/modules/tests/mocks/ethers/utils/json-wallet.js',
    '^@ledgerhq/hw-transport-u2f$': '<rootDir>/modules/tests/mocks/ledger-hw-transport-u2f.js',
    '^@ledgerhq/hw-app-eth$': '<rootDir>/modules/tests/mocks/ledger-hw-app-eth.js',
    '^ethereumjs-tx$': '<rootDir>/modules/tests/mocks/ethereumjs-tx.js',
    '^ethereumjs-util$': '<rootDir>/packages/__mocks__/ethereumjs-util.ts',
    '^bip32-path$': '<rootDir>/modules/tests/mocks/bip32-path.js',
    '^hdkey$': '<rootDir>/packages/__mocks__/hdkey.ts',
    '^web3$': '<rootDir>/modules/tests/mocks/web3.js',
  },
};
