import { hashPersonalMessage, ecrecover } from 'ethereumjs-util';
import { mocked } from 'ts-jest/utils';

import { recoverPublicKey } from '../../src/helpers';
import {
  hexSequenceNormalizer,
  recoveryParamNormalizer,
} from '../../src/normalizers';

import { HEX_HASH_TYPE } from '../../src/constants';

jest.mock('ethereumjs-util');
jest.mock('../../src/normalizers');

/*
 * Mocking a returned Buffer here
 */
const recoveredPublicKey = 'recovered-mocked-public-key';
const recoveredPublicKeyBuffer = Buffer.from(recoveredPublicKey);
const message = 'Hello, world!';
const invalidsignature = '0';
const validSignature =
  'f0445266ddd86f7d043dc1f538fe0b2fda271555af4ab5951ed84ec999e2d14e65829d0a66b34bcb752635e9ecd668e509622f9d91e7640958701208a13338e61c';
const signatureObject = {
  message,
  signature: validSignature,
};

/*
 * Mock the Buffer global object
 */
jest.spyOn(global.Buffer, 'from');
jest.spyOn(global.Buffer, 'alloc');
const mockedBufferFrom = mocked(global.Buffer.from);
const mockedBufferAlloc = mocked(global.Buffer.alloc);
const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);
const mockedRecoveryParamNormalizer = mocked(recoveryParamNormalizer);
const mockedEcrecover = mocked(ecrecover);

describe('`Core` Module', () => {
  describe('`recoverPublicKey()` helper', () => {
    afterEach(() => {
      mockedBufferFrom.mockClear();
      mockedBufferAlloc.mockClear();
      mockedHexSequenceNormalizer.mockClear();
      mockedRecoveryParamNormalizer.mockClear();
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
      expect(recoveryParamNormalizer).toHaveBeenCalledWith(
        Buffer.from(validSignature, HEX_HASH_TYPE)[64],
      );
    });
    test('Creates a hash of the message value', async () => {
      recoverPublicKey(signatureObject);
      /*
       * Calls the `ethereumjs-util` `hashPersonalMessage` method
       */
      expect(hashPersonalMessage).toHaveBeenCalled();
      expect(hashPersonalMessage).toHaveBeenCalledWith(Buffer.from(message));
    });
    test('Recovers the public key', async () => {
      recoverPublicKey(signatureObject);
      /*
       * Calls the `ethereumjs-util` `ecrecover` method
       */
      expect(mockedEcrecover).toHaveBeenCalled();
      expect(mockedEcrecover).toHaveBeenCalledWith(
        /*
         * Message hash (as a hex Buffer)
         */
        Buffer.from(message),
        /*
         * Recovery param
         */
        Buffer.from(validSignature, HEX_HASH_TYPE)[64],
        /*
         * R signature component (which is the first 32 bits of the signature)
         */
        Buffer.from(validSignature, HEX_HASH_TYPE).slice(0, 32),
        /*
         * S signature component (which is the last 32 bits of the signature)
         */
        Buffer.from(validSignature, HEX_HASH_TYPE).slice(32, 64),
      );
    });
    test('Normalizes the recovered public key before returning', async () => {
      mockedEcrecover.mockImplementation(() => recoveredPublicKeyBuffer);
      recoverPublicKey(signatureObject);
      /*
       * Normalizes the value before returning (also adds the `0x` prefix)
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenNthCalledWith(
        2,
        Buffer.from(recoveredPublicKey).toString(HEX_HASH_TYPE),
      );
    });
  });
});
