import {
  messageVerificationObjectValidator,
  verifyMessageSignature,
} from '../../../core/helpers';
import { hexSequenceNormalizer } from '../../../core/normalizers';
import { hexSequenceValidator } from '../../../core/validators';

import { verifyMessage } from '../../../ledger/staticMethods';

jest.dontMock('../../../ledger/staticMethods');

jest.mock('../../../core/helpers');
jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');

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
