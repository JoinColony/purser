import { jestMocked } from '../../../testutils';

import * as helpers from '../../src/helpers';
import { hexSequenceNormalizer } from '../../src/normalizers';
import { warning } from '../../src/utils';

const { verifyMessageSignature } = helpers;

jest.mock('ethereumjs-util');
jest.mock('../../src/validators');
jest.mock('../../src/utils');
jest.mock('../../src/normalizers');

const mockedWarning = jestMocked(warning);
const mockedHexSequenceNormalizer = jestMocked(hexSequenceNormalizer);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const publicKey = 'mocked-public-key';
const recoveredPublicKey = 'recovered-mocked-public-key';
const message = 'mocked-message';
const signature = 'mocked-signature';
const signatureObject = {
  publicKey,
  message,
  signature,
};

const mockedRecoverPublicKey = jest
  .spyOn(helpers, 'recoverPublicKey')
  .mockImplementation(() => recoveredPublicKey);

describe('`Core` Module', () => {
  describe('`verifyMessageSignature()` helper', () => {
    afterEach(() => {
      mockedWarning.mockClear();
      mockedHexSequenceNormalizer.mockClear();
    });
    test('Gets the recovered public key from `recoverPublicKey`', async () => {
      verifyMessageSignature(signatureObject);
      /*
       * Call the local `recoverPublicKey` helper
       */
      expect(mockedRecoverPublicKey).toHaveBeenCalled();
      expect(mockedRecoverPublicKey).toHaveBeenCalledWith({
        message,
        signature,
      });
    });
    test('Normalizes the recovered public key', async () => {
      verifyMessageSignature(signatureObject);
      /*
       * Call `hexSequenceNormalizer` on the recovered public key
       * (The first call)
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).nthCalledWith(
        1,
        recoveredPublicKey,
        /*
         * False, since we need remove the `0x` prefix
         */
        false,
      );
    });
    test('Normalizes the current address public key', async () => {
      verifyMessageSignature(signatureObject);
      /*
       * Call `hexSequenceNormalizer` on the passed in public key
       * (The second call)
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).nthCalledWith(
        2,
        publicKey,
        /*
         * False, since we need remove the `0x` prefix
         */
        false,
      );
    });
    test('Compares pulic keys and returns', async () => {
      const arePublicKeysEqual = verifyMessageSignature(signatureObject);
      expect(arePublicKeysEqual).toBeTruthy();
    });
    test('If something goes wrong, catches and warns the user', async () => {
      /*
       * Mock the implementation locally, so that we can throw
       */
      mockedRecoverPublicKey.mockImplementationOnce(() => {
        throw new Error();
      });
      expect(() => verifyMessageSignature(signatureObject)).not.toThrow();
      /*
       * Warn the user
       */
      expect(warning).toHaveBeenCalled();
      expect(warning).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          level: 'high',
        }),
      );
    });
  });
});
