import {
  derivationPathNormalizer,
  hexSequenceNormalizer,
} from '../../../core/normalizers';
import {
  derivationPathValidator,
  messageValidator,
} from '../../../core/validators';
import { warning } from '../../../core/utils';

import { signMessage } from '../../../trezor/staticMethods';
import { payloadListener } from '../../../trezor/helpers';

import { PAYLOAD_SIGNMSG } from '../../../trezor/payloads';
import { STD_ERRORS } from '../../../trezor/defaults';

jest.dontMock('../../../trezor/staticMethods');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/helpers');
jest.mock('../../../core/utils');
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

const derivationPath = 'mocked-derivation-path';
const message = 'mocked-message';
const mockedMessageObject = {
  derivationPath,
  message,
};

describe('`Trezor` Hardware Wallet Module Static Methods', () => {
  describe('`signMessage()` static method', () => {
    afterEach(() => {
      derivationPathNormalizer.mockClear();
      derivationPathValidator.mockClear();
      hexSequenceNormalizer.mockClear();
      messageValidator.mockClear();
      warning.mockClear();
    });
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
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(derivationPath);
      /*
       * Validates the message string
       */
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(message);
    });
    test('Normalizes the derivation path before sending', async () => {
      await signMessage(mockedMessageObject);
      /*
       * Normalizes the derivation path
       */
      expect(derivationPathNormalizer).toHaveBeenCalled();
      expect(derivationPathNormalizer).toHaveBeenCalledWith(derivationPath);
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
        derivationPath,
      });
      /*
       * Normalizes the return string
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(returnedHexString);
    });
    test('Catches is something goes wrong along the way', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error from one of the method
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error('Oh no!')),
      );
      expect(signMessage()).rejects.toThrow();
    });
    test('Log a warning if the user Cancels signing it', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a cancel response.
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error(STD_ERRORS.CANCEL_TX_SIGN)),
      );
      await signMessage(mockedMessageObject);
      /*
       * User cancelled, so we don't throw
       */
      expect(warning).toHaveBeenCalled();
      expect(signMessage(mockedMessageObject)).resolves.not.toThrow();
    });
    test('Warns the user about proprietary signature format', async () => {
      await signMessage(mockedMessageObject);
      /*
       * Wran the user
       */
      expect(warning).toHaveBeenCalled();
    });
  });
});
