import { mocked } from 'ts-jest/utils';

import { hexSequenceNormalizer } from '../../../purser-core/src/normalizers';
import { messageValidator } from '../../../purser-core/src/validators';
import { messageOrDataValidator } from '../../../purser-core/src/helpers';

import { signMessage } from '../../src/staticMethods';

jest.mock('../../../purser-core/src/validators');
jest.mock('../../../purser-core/src/helpers');
jest.mock('../../../purser-core/src/normalizers');
jest.mock('../../../purser-core/src/utils');

const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);
const mockedMessageValidator = mocked(messageValidator);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedMessageSignature = 'mocked-signed-transaction';
const mockedInjectedCallback = jest.fn((transactionObject) => {
  if (!transactionObject) {
    throw new Error();
  }
  return mockedMessageSignature;
});
const mockedMessage = 'mocked-message';
const mockedArgumentsObject = {
  message: mockedMessage,
  messageData: 'foo',
  callback: mockedInjectedCallback,
};
describe('`Software` Wallet Module', () => {
  afterEach(() => {
    mockedInjectedCallback.mockClear();
    mockedHexSequenceNormalizer.mockClear();
    mockedMessageValidator.mockClear();
  });
  describe('`signMessage()` static method', () => {
    test('Calls the injected callback', async () => {
      await signMessage(mockedArgumentsObject);
      expect(mockedInjectedCallback).toHaveBeenCalled();
      expect(mockedInjectedCallback).toHaveBeenCalledWith(mockedMessage);
    });
    test('Validates the message string', async () => {
      await signMessage(mockedArgumentsObject);
      expect(messageOrDataValidator).toHaveBeenCalled();
      expect(messageOrDataValidator).toHaveBeenCalledWith(
        expect.objectContaining({
          message: mockedMessage,
        }),
      );
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
      // @ts-ignore
      expect(() => signMessage()).toThrow();
    });
  });
});
