/*
 * The mocks folder had to be renamed in order for `jest` to not pick it up as duplicate haste mock file.
 * See:
 * https://github.com/facebook/jest/issues/2070
 */

export const derivationPathSerializer = jest.fn(() => 'mocked-derivation-path');

export const transactionObjectValidator = jest.fn(
  (transactionObject = {}) => transactionObject,
);

export const messageObjectValidator = jest.fn(
  (messageObject = {}) => messageObject,
);
