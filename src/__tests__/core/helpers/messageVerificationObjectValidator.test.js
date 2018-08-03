import { messageVerificationObjectValidator } from '../../../core/helpers';
import {
  addressValidator,
  hexSequenceValidator,
  messageValidator,
} from '../../../core/validators';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../core/normalizers';

jest.dontMock('../../../core/helpers');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const signature = 'mocked-signature';
const message = 'mocked-message';
const address = 'mocked-address';
const publicKey = 'mocked-publicKey';
const mockedMessageObject = {
  address,
  publicKey,
  signature,
  message,
};

describe('`Core` Module', () => {
  describe('`messageVerificationObjectValidator()` helper', () => {
    test("Validates all the signature's object values", async () => {
      messageVerificationObjectValidator(mockedMessageObject);
      /*
       * Validates the address
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(address);
      /*
       * Validates the public key
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(publicKey);
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
    test("Normalizes all the signature's object values", async () => {
      messageVerificationObjectValidator(mockedMessageObject);
      /*
       * Normalizes the address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(address);
      /*
       * Normalizes the public key
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(publicKey);
      /*
       * Normalizes the hex signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(signature);
    });
    test('Returns only the address', async () => {
      const validatedSignatureObject = messageVerificationObjectValidator({
        address,
        signature,
        message,
      });
      expect(validatedSignatureObject).toHaveProperty('address');
      expect(validatedSignatureObject).not.toHaveProperty('publicKey');
      expect(validatedSignatureObject).toHaveProperty('signature');
      expect(validatedSignatureObject).toHaveProperty('message');
    });
    test('Returns only the public key', async () => {
      const validatedSignatureObject = messageVerificationObjectValidator({
        publicKey,
        signature,
        message,
      });
      expect(validatedSignatureObject).toHaveProperty('publicKey');
      expect(validatedSignatureObject).not.toHaveProperty('address');
      expect(validatedSignatureObject).toHaveProperty('signature');
      expect(validatedSignatureObject).toHaveProperty('message');
    });
  });
});
