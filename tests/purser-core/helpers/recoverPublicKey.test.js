import { hashPersonalMessage, ecrecover } from 'ethereumjs-util';

import { recoverPublicKey } from '../../../modules/node_modules/@colony/purser-core/src/helpers';
import {
  hexSequenceNormalizer,
  recoveryParamNormalizer,
} from '../../../modules/node_modules/@colony/purser-core/src/normalizers';

import { HEX_HASH_TYPE } from '../../../modules/node_modules/@colony/purser-core/src/defaults';

jest.dontMock('../../../modules/node_modules/@colony/purser-core/src/helpers');

jest.mock('ethereumjs-util');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock(
  '../../../modules/node_modules/@colony/purser-core/src/normalizers',
  () =>
    /* eslint-disable-next-line global-require */
    require('../../__mocks__/@colony/purser-core/normalizers.js'),
);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */

/*
 * Mocking a returned Buffer here
 */
const recoveredPublicKey = 'recovered-mocked-public-key';
const recoveredPublicKeyBuffer = {
  toString: () => recoveredPublicKey,
};
const message = 'mocked-message';
const invalidsignature = '0';
const validSignature =
  '00000000000000000000000000000000000000000000000000000000000000000';
const signatureObject = {
  message,
  signature: validSignature,
};

/*
 * Mock the Buffer global object
 */
global.Buffer = {
  from: jest.fn(value => value),
  alloc: jest.fn(value => '0'.repeat(value)),
};

describe('`Core` Module', () => {
  describe('`recoverPublicKey()` helper', () => {
    afterEach(() => {
      global.Buffer.from.mockClear();
      global.Buffer.alloc.mockClear();
      hexSequenceNormalizer.mockClear();
    });
    test('Normalizes the signature and makes it a Buffer', async () => {
      recoverPublicKey(signatureObject);
      /*
       * Normalizes the value
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        validSignature,
        /*
         * We need to remove the `0x` prefix
         */
        false,
      );
      expect(global.Buffer.from).toHaveBeenCalled();
      expect(global.Buffer.from).toHaveBeenCalledWith(
        validSignature,
        /*
         * This is a hex hash value, so the Buffer must reflect that
         */
        HEX_HASH_TYPE,
      );
    });
    test('Checks if the signature length is valid', async () => {
      /*
       * It throws if the length is not valid, since we catch this inside `verifyMessageSignature`
       */
      expect(() =>
        recoverPublicKey({
          ...signatureObject,
          signature: invalidsignature,
        }),
      ).toThrow();
    });
    test('Normalizes the reco(V)ery param', async () => {
      recoverPublicKey(signatureObject);
      /*
       * Calls the normalizer
       */
      expect(recoveryParamNormalizer).toHaveBeenCalled();
      expect(recoveryParamNormalizer).toHaveBeenCalledWith(validSignature[64]);
    });
    test('Creates a hash of the message value', async () => {
      recoverPublicKey(signatureObject);
      /*
       * Calls the `ethereumjs-util` `hashPersonalMessage` method
       */
      expect(hashPersonalMessage).toHaveBeenCalled();
      expect(hashPersonalMessage).toHaveBeenCalledWith(message);
    });
    test('Recovers the public key', async () => {
      recoverPublicKey(signatureObject);
      /*
       * Calls the `ethereumjs-util` `ecrecover` method
       */
      expect(ecrecover).toHaveBeenCalled();
      expect(ecrecover).toHaveBeenCalledWith(
        /*
         * Message hash (as a hex Buffer)
         */
        message,
        /*
         * Recovery param
         */
        validSignature[64],
        /*
         * R signature component (which is the first 32 bits of the signature)
         */
        validSignature.slice(0, 32),
        /*
         * S signature component (which is the last 32 bits of the signature)
         */
        validSignature.slice(32, 64),
      );
    });
    test('Normalizes the recovered public key before returning', async () => {
      ecrecover.mockImplementation(() => recoveredPublicKeyBuffer);
      recoverPublicKey(signatureObject);
      /*
       * Normalizes the value before returning (also adds the `0x` prefix)
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).nthCalledWith(2, recoveredPublicKey);
    });
  });
});
