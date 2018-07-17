import { verifyMessage } from '../../trezor/staticMethods';
import { payloadListener } from '../../trezor/helpers';
import {
  addressValidator,
  messageValidator,
  hexSequenceValidator,
} from '../../trezor/validators';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../trezor/normalizers';

import { PAYLOAD_VERIFYMSG } from '../../trezor/payloads';

jest.dontMock('../../trezor/staticMethods');

jest.mock('../../trezor/helpers');
jest.mock('../../trezor/validators');
jest.mock('../../trezor/normalizers');

describe('`Trezor` Hardware Wallet Module', () => {
  describe('`verifyMessage()` static method', () => {
    test('Uses the correct trezor service payload type', async () => {
      const { type, requiredFirmware } = PAYLOAD_VERIFYMSG;
      await verifyMessage({
        /*
         * These values are not correct. Do not use the as reference.
         * If the validators wouldn't be mocked, they wouldn't pass.
         */
        address: 0,
        mesasge: 0,
        signature: 0,
      });
      expect(payloadListener).toHaveBeenCalled();
      expect(payloadListener).toHaveBeenCalledWith({
        payload: {
          /*
           * We only care about what payload type this method sends
           */
          address: expect.anything(),
          message: expect.anything(),
          signature: expect.anything(),
          /*
           * These two values should be correct
           */
          type,
          requiredFirmware,
        },
      });
    });
    test('Validates message/signature input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      const address = 'mocked-derivation-address';
      const message = 'mocked-message';
      const signature = 'mocked-signature';
      await verifyMessage({
        address,
        message,
        signature,
      });
      /*
       * Validates the address
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(address);
      /*
       * Validates the message that is to be signed
       */
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(message);
      /*
       * Validates the hex signature
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(signature);
    });
    test('Normalizes message/signature input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      const address = 'mocked-derivation-address';
      const signature = 'mocked-signature';
      await verifyMessage({
        address,
        signature,
      });
      /*
       * Normalizes the address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(address, false);
      /*
       * Normalizes the signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(signature, false);
    });
  });
});
