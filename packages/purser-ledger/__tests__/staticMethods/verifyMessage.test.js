import {
  messageVerificationObjectValidator,
  verifyMessageSignature,
} from '@colony/purser-core/helpers';
import { hexSequenceNormalizer } from '@colony/purser-core/normalizers';
import { hexSequenceValidator } from '@colony/purser-core/validators';

import { verifyMessage } from '@colony/purser-ledger/staticMethods';

jest.dontMock('@colony/purser-ledger/staticMethods');

jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers.js'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers.js'),
);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const publicKey = 'mocked-publicKey';
const message = 'mocked-message';
const signature = 'mocked-signature';
const mockedSignatureObject = {
  message,
  signature,
};
const mockedArgumentsObject = {
  ...mockedSignatureObject,
  publicKey,
};

describe('`Ledger` Hardware Wallet Module Static Methods', () => {
  describe('`verifyMessage()` static method', () => {
    afterEach(() => {
      messageVerificationObjectValidator.mockClear();
      hexSequenceValidator.mockClear();
      hexSequenceNormalizer.mockClear();
    });
    test('Validates signature object input values', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Validates the message signature verification object
       */
      expect(messageVerificationObjectValidator).toHaveBeenCalled();
      expect(messageVerificationObjectValidator).toHaveBeenCalledWith(
        mockedSignatureObject,
      );
    });
    test('Validates the public key individually', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Validates the public key
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(publicKey);
    });
    test('Normalizes the public and signature before sending', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Normalizes both the public keys and the signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(publicKey);
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(signature);
    });
    test('Calls the `verifyMessageSignature` core helper', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the message signature verification helper method
       */
      expect(verifyMessageSignature).toHaveBeenCalled();
      expect(verifyMessageSignature).toHaveBeenCalledWith(
        mockedArgumentsObject,
      );
    });
  });
});
