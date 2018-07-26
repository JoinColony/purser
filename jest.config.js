module.exports = {
  rootDir: 'src',
  collectCoverageFrom: [
    '*.{js}',
    'core/*.{js}',
    'software/*.{js}',
    'trezor/*.{js}',
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
    '^ethers$': '<rootDir>/src/__mocks__/ethers',
    '^qrcode$': '<rootDir>/src/__mocks__/qrcode.js',
    '^ethereum-blockies$': '<rootDir>/src/__mocks__/ethereum-blockies.js',
    '^bip32-path$': '<rootDir>/src/__mocks__/bip32-path.js',
    '^ethereumjs-tx$': '<rootDir>/src/__mocks__/ethereumjs-tx.js',
    '^hdkey$': '<rootDir>/src/__mocks__/hdkey.js',
  },
};
