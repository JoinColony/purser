import {
  addressValidator,
  messageValidator,
  hexSequenceValidator,
} from '../../../core/validators';

import * as utils from '../../../utils';

import { verifyMessage } from '../../../trezor/staticMethods';
import { payloadListener } from '../../../trezor/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../core/normalizers';

import { PAYLOAD_VERIFYMSG } from '../../../trezor/payloads';

jest.dontMock('../../../trezor/staticMethods');

jest.mock('../../../trezor/helpers');
jest.mock('../../../core/validators');
jest.mock('../../../utils');
/*
 * Manual mocking a manual mock. Yay for Jest being build by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../core/normalizers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../core/__mocks-required__/normalizers'),
);

const address = 'mocked-derivation-address';
const message = 'mocked-message';
const signature = 'mocked-signature';

describe('`Trezor` Hardware Wallet Module Static Methods', () => {
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
    test('Catches and warns the user if the signature is invalid', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error from one of the method
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error('Invalid signature')),
      );
      const verification = await verifyMessage({
        address,
        signature,
      });
      expect(utils.warning).toHaveBeenCalled();
      expect(verification).toBeFalsy();
    });
  });
});
