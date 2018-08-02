import {
  messageVerificationObjectValidator,
  verifyMessageSignature,
} from '../../../core/helpers';

import { verifyMessage } from '../../../ledger/staticMethods';

jest.dontMock('../../../ledger/staticMethods');

jest.mock('../../../core/helpers');

const publicKey = 'mocked-public-key';
const message = 'mocked-message';
const signature = 'mocked-signature';
const mockedSignatureMessage = {
  publicKey,
  message,
  signature,
};

describe('`Ledger` Hardware Wallet Module Static Methods', () => {
  describe('`verifyMessage()` static method', () => {
    test('Validates message input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await verifyMessage(mockedSignatureMessage);
      /*
       * Validates the message signature verification object
       */
      expect(messageVerificationObjectValidator).toHaveBeenCalled();
      expect(messageVerificationObjectValidator).toHaveBeenCalledWith(
        mockedSignatureMessage,
      );
    });
    test('Calls the `verifyMessageSignature` core helper', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await verifyMessage(mockedSignatureMessage);
      /*
       * Calls the message signature verification helper method
       */
      expect(verifyMessageSignature).toHaveBeenCalled();
      expect(verifyMessageSignature).toHaveBeenCalledWith(
        mockedSignatureMessage,
      );
    });
  });
});
