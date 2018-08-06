import { messageObjectValidator } from '../../../core/helpers';
import {
  derivationPathValidator,
  messageValidator,
} from '../../../core/validators';
import { derivationPathNormalizer } from '../../../core/normalizers';

jest.dontMock('../../../core/helpers');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const derivationPath = 'mocked-derivation-path';
const message = 'mocked-message';
const mockedMessageObject = {
  derivationPath,
  message,
};

describe('`Core` Module', () => {
  describe('`messageObjectValidator()` helper', () => {
    test("Validates all the message's object values", async () => {
      messageObjectValidator(mockedMessageObject);
      /*
       * Validates the derivation path
       */
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(derivationPath);
      /*
       * Validates the message that is to be signed
       */
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(message);
    });
    test('Normalizes the derivation path', async () => {
      messageObjectValidator(mockedMessageObject);
      /*
       * Normalizes the derivation path
       */
      expect(derivationPathNormalizer).toHaveBeenCalled();
      expect(derivationPathNormalizer).toHaveBeenCalledWith(derivationPath);
    });
    test('Returns the validated message object', async () => {
      const validatedMessageObject = messageObjectValidator(
        mockedMessageObject,
      );
      expect(validatedMessageObject).toHaveProperty('derivationPath');
      expect(validatedMessageObject).toHaveProperty('message');
    });
    test('Has a empty string as a message fallback', async () => {
      const validatedMessageObject = messageObjectValidator();
      expect(validatedMessageObject).toHaveProperty('message', ' ');
    });
  });
});
