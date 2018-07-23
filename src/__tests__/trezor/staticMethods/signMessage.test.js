import { signMessage } from '../../../trezor/staticMethods';
import { payloadListener } from '../../../trezor/helpers';
import {
  derivationPathValidator,
  messageValidator,
} from '../../../trezor/validators';
import {
  derivationPathNormalizer,
  hexSequenceNormalizer,
} from '../../../trezor/normalizers';

import { PAYLOAD_SIGNMSG } from '../../../trezor/payloads';

jest.dontMock('../../../trezor/staticMethods');

jest.mock('../../../trezor/helpers');
jest.mock('../../../trezor/validators');
jest.mock('../../../trezor/normalizers');

const path = 'mocked-derivation-path';

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
        payload: {
          /*
           * We only care about what payload type this method sends
           */
          path: expect.anything(),
          message: expect.anything(),
          /*
           * These two values should be correct
           */
          type,
          requiredFirmware,
        },
      });
    });
    test('Validates message input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      const message = 'mocked-message';
      await signMessage({
        path,
        message,
      });
      /*
       * Validates the derivation path
       */
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(path);
      /*
       * Validates the message that is to be signed
       */
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(message);
    });
    test('Normalizes message input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await signMessage({
        path,
      });
      /*
       * Normalizes the derivation path
       */
      expect(derivationPathNormalizer).toHaveBeenCalled();
      expect(derivationPathNormalizer).toHaveBeenCalledWith(path);
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
