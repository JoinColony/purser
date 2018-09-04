import { messageVerificationObjectValidator } from '../../../core/helpers';
import {
  hexSequenceValidator,
  messageValidator,
} from '../../../core/validators';
import { hexSequenceNormalizer } from '../../../core/normalizers';

jest.dontMock('../../../core/helpers');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const signature = 'mocked-signature';
const message = 'mocked-message';
const mockedMessageObject = {
  signature,
  message,
};

describe('`Core` Module', () => {
  describe('`messageVerificationObjectValidator()` helper', () => {
    afterEach(() => {
      hexSequenceValidator.mockClear();
      messageValidator.mockClear();
      hexSequenceNormalizer.mockClear();
    });
    test("Validates only the signature's object values", async () => {
      messageVerificationObjectValidator(mockedMessageObject);
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
    test('Normalizes just the signature values', async () => {
      messageVerificationObjectValidator(mockedMessageObject);
      /*
       * Normalizes the hex signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(signature);
    });
    test('Returns the values', async () => {
      const validatedSignatureObject = messageVerificationObjectValidator(
        mockedMessageObject,
      );
      expect(validatedSignatureObject).toHaveProperty('signature');
      expect(validatedSignatureObject).toHaveProperty('message');
    });
    test("Does not validate, if it's not passed a valid orbject", async () => {
      /*
       * Because of the way we mocked it (and not just spyed of it), jest doesn't
       * allow us to automatically restore it using `mockRestore`, so we actually
       * have to re-write part of it's functionality.
       *
       * See:https://jestjs.io/docs/en/mock-function-api.html#mockfnmockrestore
       */
      messageValidator.mockImplementation(value => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      expect(() => messageVerificationObjectValidator()).toThrow();
    });
  });
});
