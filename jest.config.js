module.exports = {
  rootDir: 'src',
  collectCoverageFrom: [
    '*.{js}',
    'trezor/*.{js}',
    /*
     * Exports debug objects, no functionality
     */
    '!debug.js',
    /*
     * String assignments, will always pass
     */
    '!defaults.js',
    /*
     * Exports main library objects, no functionality
     */
    '!index.js',
    /*
     * String assignments, will always pass
     */
    '!messages.js',
    /*
     * Exports hardware wallets objects, no functionality
     */
    '!hardware.js',
    /*
     * Exports all wallets objects, no functionality
     */
    '!wallets.js',
    /*
     * String assignments, will always pass
     */
    '!walletTypes.js',
    /*
     * String assignments, will always pass
     */
    '!trezor/defaults.js',
    /*
     * String assignments, will always pass
     */
    '!trezor/messages.js',
    /*
     * String assignments, will always pass
     */
    '!trezor/payloads.js',
    /*
     * String assignments, will always pass
     */
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
