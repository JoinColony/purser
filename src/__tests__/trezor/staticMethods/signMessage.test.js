import { messageObjectValidator } from '../../../core/helpers';

import { signMessage } from '../../../trezor/staticMethods';
import { payloadListener } from '../../../trezor/helpers';
import { hexSequenceNormalizer } from '../../../core/normalizers';

import { PAYLOAD_SIGNMSG } from '../../../trezor/payloads';

jest.dontMock('../../../trezor/staticMethods');

jest.mock('../../../core/validators');
jest.mock('../../../trezor/helpers');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../core/normalizers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../core/__remocks__/normalizers'),
);
jest.mock('../../../core/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../core/__remocks__/helpers'),
);

const path = 'mocked-derivation-path';
const mockedMessageObject = {
  derivationPath: path,
  message: 'mocked-message',
};

describe('`Trezor` Hardware Wallet Module Static Methods', () => {
  describe('`signMessage()` static method', () => {
    test('Uses the correct trezor service payload type', async () => {
      const { type, requiredFirmware } = PAYLOAD_SIGNMSG;
      await signMessage({
        /*
         * These values are not correct. Do not use the as reference.
         * If the validators wouldn't be mocked, they wouldn't pass.
         */
        path: 0,
        mesasge: 0,
      });
      expect(payloadListener).toHaveBeenCalled();
      expect(payloadListener).toHaveBeenCalledWith({
        /*
        * We only care about what payload type this method sends
        */
        payload: expect.objectContaining({
          type,
          requiredFirmware,
        }),
      });
    });
    test('Validates message input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await signMessage(mockedMessageObject);
      /*
       * Validates the derivation path
       */
      expect(messageObjectValidator).toHaveBeenCalled();
      expect(messageObjectValidator).toHaveBeenCalledWith(mockedMessageObject);
    });
    test('Normalizes the return hex string', async () => {
      const returnedHexString = '48656c6c6f20796f75';
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a different response
       */
      payloadListener.mockImplementation(() => ({
        signature: returnedHexString,
      }));
      await signMessage({
        path,
      });
      /*
       * Normalizes the return string
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(returnedHexString);
    });
  });
});
