module.exports = {
  rootDir: 'src',
  collectCoverageFrom: [
    '*.{js}',
    'core/*.{js}',
    'software/*.{js}',
    'trezor/*.{js}',
    'ledger/*.{js}',
    'metamask/*.{js}',
    /*
     * Exports debug objects, no functionality
     */
    '!debug.js',
    /*
     * String assignments, will always pass
     */
    '!defaults.js',
    '!core/defaults.js',
    '!trezor/defaults.js',
    '!ledger/defaults.js',
    '!metamask/defaults.js',
    /*
     * Exports main library objects, no functionality
     */
    '!index.js',
    '!core/index.js',
    /*
     * String assignments, will always pass
     */
    '!messages.js',
    '!core/messages.js',
    '!software/messages.js',
    '!trezor/messages.js',
    '!ledger/messages.js',
    '!metamask/messages.js',
    /*
     * String assignments, will always pass
     */
    '!core/types.js',
    /*
     * String assignments, will always pass
     */
    '!trezor/payloads.js',
    '!trezor/responses.js',
    /*
     * Just method wrappers (provide a nicer function name for Metamask's methods)
     */
    '!metamask/methodLinks.js',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 80,
    },
  },
  moduleNameMapper: {
    '^ethers$': '<rootDir>/__mocks__/ethers',
    '^bip32-path$': '<rootDir>/__mocks__/bip32-path.js',
    '^ethereumjs-tx$': '<rootDir>/__mocks__/ethereumjs-tx.js',
    '^ethereumjs-util$': '<rootDir>/__mocks__/ethereumjs-util.js',
    '^hdkey$': '<rootDir>/__mocks__/hdkey.js',
    '^@ledgerhq/hw-transport-u2f$': '<rootDir>/__mocks__/ledger-hw-transport-u2f.js',
    '^@ledgerhq/hw-app-eth$': '<rootDir>/__mocks__/ledger-hw-app-eth.js',
  },
};
