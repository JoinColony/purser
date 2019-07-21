/*
 * The mocks folder had to be renamed in order for `jest` to not pick it up as duplicate haste mock file.
 * See:
 * https://github.com/facebook/jest/issues/2070
 */

export const derivationPathSerializer = jest.fn(() => 'mocked-derivation-path');

export const transactionObjectValidator = jest.fn(
  (transactionObject = {}) => transactionObject,
);

export const messageVerificationObjectValidator = jest.fn(
  (signedMessageObject = {}) => signedMessageObject,
);

export const verifyMessageSignature = jest.fn();

export const recoverPublicKey = jest.fn(() => 'recovered-mocked-public-key');

export const userInputValidator = jest.fn();

export const messageOrDataValidator = jest.fn(
  ({ message, messageData } = {}) => {
    if (message) {
      return message;
    }
    return messageData;
  },
);

export const getChainDefinition = jest.fn(() => ({
  common: { chainId: 'mocked-chain-id' },
}));
