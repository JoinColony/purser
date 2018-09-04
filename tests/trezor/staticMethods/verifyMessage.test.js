import { warning } from '../../../core/utils';
import { messageVerificationObjectValidator } from '../../../core/helpers';

import { verifyMessage } from '../../../trezor/staticMethods';
import { payloadListener } from '../../../trezor/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../core/normalizers';
import { addressValidator } from '../../../core/validators';

import { PAYLOAD_VERIFYMSG } from '../../../trezor/payloads';

jest.dontMock('../../../trezor/staticMethods');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/utils');
jest.mock('../../../core/helpers');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../trezor/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../trezor/__remocks__/helpers'),
);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const address = 'mocked-derivation-address';
const message = 'mocked-message';
const signature = 'mocked-signature';
const mockedSignatureObject = {
  message,
  signature,
};
const mockedArgumentsObject = {
  ...mockedSignatureObject,
  address,
};

describe('`Trezor` Hardware Wallet Module Static Methods', () => {
  describe('`verifyMessage()` static method', () => {
    afterEach(() => {
      payloadListener.mockClear();
      addressNormalizer.mockClear();
      hexSequenceNormalizer.mockClear();
      addressValidator.mockClear();
    });
    test('Uses the correct trezor service payload type', async () => {
      const { type, requiredFirmware } = PAYLOAD_VERIFYMSG;
      await verifyMessage({
        address: 0,
        mesasge: 0,
        signature: 0,
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
    test('Validates message/signature input values', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validator helper
       */
      expect(messageVerificationObjectValidator).toHaveBeenCalled();
      expect(messageVerificationObjectValidator).toHaveBeenCalledWith(
        mockedSignatureObject,
      );
    });
    test('Validates the address individually', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Validates the address
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(address);
    });
    test('Normalizes message/signature input values', async () => {
      await verifyMessage(mockedArgumentsObject);
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
      const verification = await verifyMessage();
      expect(warning).toHaveBeenCalled();
      expect(verification).toBeFalsy();
    });
    test('Warns the user about proprietary signature format', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Wran the user
       */
      expect(warning).toHaveBeenCalled();
    });
  });
});
