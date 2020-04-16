/*
 * The mocks folder had to be renamed in order for `jest` to not pick it up as duplicate haste mock file.
 * See:
 * https://github.com/facebook/jest/issues/2070
 */

const signTransaction = jest.fn(() => ({
  r: 'mocked-R-signature-component',
  s: 'mocked-S-signature-component',
  v: 'mocked-recovery-param',
}));

const signPersonalMessage = jest.fn(() => ({
  r: 'mocked-R-signature-component',
  s: 'mocked-S-signature-component',
  v: 'mocked-recovery-param',
}));

export const ledgerConnection: jest.Mock<any, any> & {
  signTransaction?: jest.Mock<any, any>;
  signPersonalMessage?: jest.Mock<any, any>;
} = jest.fn(() => ({
  getAddress: jest.fn(() => ({
    publicKey: 'mocked-public-key',
    chainCode: 'mocked-chain-code',
  })),
  signTransaction,
  signPersonalMessage,
}));

/*
 * Little bit of trickery to get the same instance of each method as the
 * actual code does.
 *
 * This one (added to the `ledgerConnection` instance) is used to spy on.
 * The one obtained from instantiating `ledgerConnection` will be used by the actual
 * code to call (mocked).
 */
ledgerConnection.signTransaction = signTransaction;
ledgerConnection.signPersonalMessage = signPersonalMessage;

export const handleLedgerConnectionError = jest.fn();
