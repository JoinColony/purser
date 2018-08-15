import { warning } from '../../../core/utils';

import { signMessage } from '../../../metamask/staticMethods';
import { methodCaller } from '../../../metamask/helpers';
import { hexSequenceNormalizer } from '../../../core/normalizers';
import {
  addressValidator,
  messageValidator,
  hexSequenceValidator,
} from '../../../core/validators';

import { STD_ERRORS } from '../../../metamask/defaults';

jest.dontMock('../../../metamask/staticMethods');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/utils');
jest.mock('../../../core/helpers');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../metamask/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../metamask/__remocks__/helpers'),
);

/*
 * Mock the injected web3 proxy object
 */
const mockedMessageSignature = 'mocked-message-signature';
const callbackError = { message: 'no-error-here' };
global.web3 = {
  personal: {
    sign: jest.fn((message, address, callback) =>
      callback(callbackError, mockedMessageSignature),
    ),
  },
};
/*
 * Mock the Buffer global object
 */
const mockedToString = jest.fn(function mockedToString() {
  return this;
});
global.Buffer = {
  from: jest.fn(value => ({
    toString: mockedToString.bind(value),
  })),
};

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedAddress = 'mocked-address';
const mockedMessage = 'mocked-message';
const mockedArgumentsObject = {
  message: mockedMessage,
  currentAddress: mockedAddress,
};

describe('`Metamask` Wallet Module Static Methods', () => {
  afterEach(() => {
    global.web3.personal.sign.mockClear();
    global.Buffer.from.mockClear();
    methodCaller.mockClear();
    addressValidator.mockClear();
    messageValidator.mockClear();
    hexSequenceValidator.mockClear();
    warning.mockClear();
    hexSequenceNormalizer.mockClear();
  });
  describe('`signMessage()` static method', () => {
    test('Calls the correct metamask injected method', async () => {
      await signMessage(mockedArgumentsObject);
      expect(global.web3.personal.sign).toHaveBeenCalled();
      expect(global.web3.personal.sign).toHaveBeenCalledWith(
        mockedMessage,
        mockedAddress,
        expect.any(Function),
      );
    });
    test('Detects if the injected proxy is avaialable', async () => {
      await signMessage(mockedArgumentsObject);
      expect(methodCaller).toHaveBeenCalled();
    });
    test('Throws if no argument provided', async () => {
      /*
       * Because of the way we mocked it (and not just spyed of it), jest doesn't
       * allow us to automatically restore it using `mockRestore`, so we actually
       * have to re-write part of it's functionality.
       *
       * See:https://jestjs.io/docs/en/mock-function-api.html#mockfnmockrestore
       */
      addressValidator.mockImplementation(value => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      expect(signMessage()).rejects.toThrow();
    });
    test('Validates the `currentAddress` individually', async () => {
      await signMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedAddress);
    });
    test('Validates the `message` string individually', async () => {
      await signMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(mockedMessage);
    });
    test('Normalizes the message before sending it to Metamask', async () => {
      await signMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(mockedMessage);
    });
    test('Validates the returned message signature', async () => {
      await signMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(mockedMessageSignature);
    });
    test('Normalizes the message signature before returning', async () => {
      await signMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        mockedMessageSignature,
      );
    });
    test('Returns the message signature', async () => {
      const messageSignature = await signMessage(mockedArgumentsObject);
      expect(messageSignature).toEqual(mockedMessageSignature);
    });
    test('Throws if something goes wrong while signing', async () => {
      /*
       * Mock it locally to simulate an error
       */
      hexSequenceValidator.mockImplementation(() => {
        throw new Error();
      });
      expect(signMessage(mockedArgumentsObject)).rejects.toThrow();
    });
    test('Warns if the user cancelled signing the message', async () => {
      /*
       * Mock it locally to simulate an error
       */
      hexSequenceValidator.mockImplementation(() => {
        throw new Error();
      });
      global.web3.personal.sign.mockImplementation(
        (message, address, callback) =>
          callback(
            { ...callbackError, message: STD_ERRORS.CANCEL_MSG_SIGN },
            mockedMessageSignature,
          ),
      );
      expect(() => signMessage(mockedArgumentsObject)).not.toThrow();
      expect(warning).toHaveBeenCalled();
    });
  });
});
