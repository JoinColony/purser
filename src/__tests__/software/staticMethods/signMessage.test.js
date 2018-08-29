import { hexSequenceNormalizer } from '../../../core/normalizers';
import { messageValidator } from '../../../core/validators';

import { signMessage } from '../../../software/staticMethods';

jest.dontMock('../../../software/staticMethods');

jest.mock('../../../core/helpers');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/validators');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedMessageSignature = 'mocked-signed-transaction';
const mockedInjectedCallback = jest.fn(transactionObject => {
  if (!transactionObject) {
    throw new Error();
  }
  return mockedMessageSignature;
});
const mockedMessage = 'mocked-message';
const mockedArgumentsObject = {
  message: mockedMessage,
  callback: mockedInjectedCallback,
};
describe('`Software` Wallet Module', () => {
  afterEach(() => {
    mockedInjectedCallback.mockClear();
    hexSequenceNormalizer.mockClear();
    messageValidator.mockClear();
  });
  describe('`signMessage()` static method', () => {
    test('Calls the injected callback', async () => {
      await signMessage(mockedArgumentsObject);
      expect(mockedInjectedCallback).toHaveBeenCalled();
      expect(mockedInjectedCallback).toHaveBeenCalledWith(mockedMessage);
    });
    test('Validates the message string', async () => {
      await signMessage(mockedArgumentsObject);
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(mockedMessage);
    });
    test('Normalizes the message signature before returning', async () => {
      await signMessage(mockedArgumentsObject);
      /*
       * The message signature hex string
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        mockedMessageSignature,
      );
    });
    test('Throws if something goes wrong', async () => {
      expect(signMessage()).rejects.toThrow();
    });
  });
});
