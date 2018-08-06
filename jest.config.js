module.exports = {
  rootDir: 'src',
  collectCoverageFrom: [
    '*.{js}',
    'core/*.{js}',
    'software/*.{js}',
    'trezor/*.{js}',
    'ledger/*.{js}',
    /*
     * Exports debug objects, no functionality
     */
    '!debug.js',
    /*
     * String assignments, will always pass
     */
    '!defaults.js',
    '!core/defaults.js',
    '!software/defaults.js',
    '!trezor/defaults.js',
    '!ledger/defaults.js',
    /*
     * Exports main library objects, no functionality
     */
    '!index.js',
    '!core/index.js',
    '!software/index.js',
    /*
     * String assignments, will always pass
     */
    '!messages.js',
    '!core/messages.js',
    '!software/messages.js',
    '!trezor/messages.js',
    '!ledger/messages.js',
    /*
     * String assignments, will always pass
     */
    '!core/types.js',
    /*
     * String assignments, will always pass
     */
    '!trezor/payloads.js',
    '!trezor/responses.js',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 80,
    },
  },
  moduleNameMapper: {
    '^ethers$': '<rootDir>/__mocks__/ethers',
    '^qrcode$': '<rootDir>/__mocks__/qrcode.js',
    '^ethereum-blockies$': '<rootDir>/__mocks__/ethereum-blockies.js',
    '^bip32-path$': '<rootDir>/__mocks__/bip32-path.js',
    '^ethereumjs-tx$': '<rootDir>/__mocks__/ethereumjs-tx.js',
    '^ethereumjs-util$': '<rootDir>/__mocks__/ethereumjs-util.js',
    '^hdkey$': '<rootDir>/__mocks__/hdkey.js',
    '^@ledgerhq/hw-transport-u2f$': '<rootDir>/__mocks__/ledger-hw-transport-u2f.js',
    '^@ledgerhq/hw-app-eth$': '<rootDir>/__mocks__/ledger-hw-app-eth.js',
  },
};
