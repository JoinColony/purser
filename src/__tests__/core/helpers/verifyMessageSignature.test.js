import { hashPersonalMessage, ecrecover } from 'ethereumjs-util';
import { verifyMessageSignature } from '../../../core/helpers';
import { hexSequenceNormalizer } from '../../../core/normalizers';
import { warning } from '../../../core/utils';

import { SIGNATURE } from '../../../core/defaults';

jest.dontMock('../../../core/helpers');

jest.mock('ethereumjs-util');
jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/utils');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const publicKey = 'mocked-public-key';
const message = 'mocked-message';
const invalidsignature = '0';
const validSignature =
  '00000000000000000000000000000000000000000000000000000000000000000' +
  '00000000000000000000000000000000000000000000000000000000000000000';
const signatureObject = {
  publicKey,
  message,
  signature: validSignature,
};

describe('`Core` Module', () => {
  describe('`verifyMessageSignature()` helper', () => {
    afterEach(() => {
      warning.mockClear();
      warning.mockRestore();
      hexSequenceNormalizer.mockClear();
      hexSequenceNormalizer.mockRestore();
      ecrecover.mockClear();
      ecrecover.mockRestore();
    });
    test('Checks if the signature legth is valid', async () => {
      const isSignatureValid = verifyMessageSignature({
        ...signatureObject,
        signature: invalidsignature,
      });
      /*
       * Warn the user
       */
      expect(warning).toHaveBeenCalled();
      /*
       * And return false
       */
      expect(isSignatureValid).toBeFalsy();
    });
    test('Normalizes the signature', async () => {
      verifyMessageSignature(signatureObject);
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      /*
       * Also removes the `0x` prefix
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(validSignature, false);
    });
    test('Correctly sets the odd recovery param', async () => {
      verifyMessageSignature({
        ...signatureObject,
        signature: `${validSignature.slice(0, 129)}1`,
      });
      expect(ecrecover).toHaveBeenCalled();
      expect(ecrecover).toHaveBeenCalledWith(
        expect.any(Object),
        SIGNATURE.RECOVERY_ODD,
        expect.any(Object),
        expect.any(Object),
      );
    });
    test('Correctly sets the even recovery param', async () => {
      verifyMessageSignature({
        ...signatureObject,
        signature: `${validSignature.slice(0, 129)}2`,
      });
      expect(ecrecover).toHaveBeenCalled();
      expect(ecrecover).toHaveBeenCalledWith(
        expect.any(Object),
        SIGNATURE.RECOVERY_EVEN,
        expect.any(Object),
        expect.any(Object),
      );
    });
    test('Hashes the message as a hex Buffer', async () => {
      verifyMessageSignature(signatureObject);
      expect(hashPersonalMessage).toHaveBeenCalled();
      expect(hashPersonalMessage).toHaveBeenCalledWith(Buffer.from(message));
    });
    test('Normalizes the public key before comparing', async () => {
      verifyMessageSignature(signatureObject);
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      /*
       * Also removes the `0x` prefix
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(publicKey, false);
    });
    test('Compares the recovered public and returns', async () => {
      const isSignatureValid = verifyMessageSignature({
        ...signatureObject,
        /*
         * Make it validate by matching the mocked return
         */
        publicKey: Buffer.alloc(33).toString('hex'),
      });
      expect(isSignatureValid).toBeTruthy();
    });
    test('If something goes wrong, catch and warn the user', async () => {
      ecrecover.mockImplementationOnce(() => {
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
