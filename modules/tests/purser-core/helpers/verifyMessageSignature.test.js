import * as helpers from '@colony/purser-core/helpers';
import { hexSequenceNormalizer } from '@colony/purser-core/normalizers';
import { warning } from '@colony/purser-core/utils';

jest.mock('ethereumjs-util');
jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils.js'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers.js'),
);

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

/*
 * We just need this method mocked, but since it's declared in a module we
 * need to test we have do do this little go-around trick and use the default export
 *
 * See: https://github.com/facebook/jest/issues/936
 */
helpers.default.recoverPublicKey = jest.fn(() => recoveredPublicKey);

const { verifyMessageSignature } = helpers;
const { recoverPublicKey } = helpers.default;

describe('`Core` Module', () => {
  describe('`verifyMessageSignature()` helper', () => {
    afterEach(() => {
      warning.mockClear();
      hexSequenceNormalizer.mockClear();
    });
    test('Gets the recovered public key from `recoverPublicKey`', async () => {
      verifyMessageSignature(signatureObject);
      /*
       * Call the local `recoverPublicKey` helper
       */
      expect(recoverPublicKey).toHaveBeenCalled();
      expect(recoverPublicKey).toHaveBeenCalledWith({
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
      helpers.default.recoverPublicKey.mockImplementationOnce(() => {
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
