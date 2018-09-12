import { hexSequenceNormalizer } from '@colony/purser-core/normalizers';
import { messageValidator } from '@colony/purser-core/validators';

import { signMessage } from '@colony/purser-software/staticMethods';

jest.dontMock('@colony/purser-software/staticMethods');

jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);

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
