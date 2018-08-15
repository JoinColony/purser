import { messageVerificationObjectValidator } from '../../../core/helpers';

import { verifyMessage } from '../../../metamask/staticMethods';
import { methodCaller } from '../../../metamask/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../core/normalizers';
import {
  addressValidator,
  hexSequenceValidator,
} from '../../../core/validators';

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
const mockedRecoveredAddress = 'mocked-message-signature';
const callbackError = { message: 'no-error-here' };
global.web3 = {
  personal: {
    ecRecover: jest.fn((message, signature, callback) =>
      callback(callbackError, mockedRecoveredAddress),
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
const mockedCurrentAddress = 'mocked-address';
const mockedMessage = 'mocked-message';
const mockedSignature = 'mocked-signature';
const mockedArgumentsObject = {
  message: mockedMessage,
  signature: mockedSignature,
  currentAddress: mockedCurrentAddress,
};

describe('`Metamask` Wallet Module Static Methods', () => {
  afterEach(() => {
    global.web3.personal.ecRecover.mockClear();
    methodCaller.mockClear();
    messageVerificationObjectValidator.mockClear();
    addressValidator.mockClear();
    // safeIntegerValidator.mockClear();
    hexSequenceValidator.mockClear();
    // warning.mockClear();
    addressNormalizer.mockClear();
    // hexSequenceNormalizer.mockClear();
  });
  describe('`verifyMessage()` static method', () => {
    test('Calls the correct metamask injected method', async () => {
      await verifyMessage(mockedArgumentsObject);
      expect(global.web3.personal.ecRecover).toHaveBeenCalled();
      expect(global.web3.personal.ecRecover).toHaveBeenCalledWith(
        mockedMessage,
        mockedSignature,
        expect.any(Function),
      );
    });
    test('Detects if the injected proxy is avaialable', async () => {
      await verifyMessage(mockedArgumentsObject);
      expect(methodCaller).toHaveBeenCalled();
    });
    test('Validates the message signature object', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(messageVerificationObjectValidator).toHaveBeenCalled();
      expect(messageVerificationObjectValidator).toHaveBeenCalledWith({
        message: mockedMessage,
        signature: mockedSignature,
      });
    });
    test('Throws if no argument provided', async () => {
      /*
       * Because of the way we mocked it (and not just spyed of it), jest doesn't
       * allow us to automatically restore it using `mockRestore`, so we actually
       * have to re-write part of it's functionality.
       *
       * See: https://jestjs.io/docs/en/mock-function-api.html#mockfnmockrestore
       */
      addressValidator.mockImplementation(value => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      expect(verifyMessage()).rejects.toThrow();
    });
    test('Validates the current address individually', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedCurrentAddress);
    });
    test('Normalizes the signature before sending it to Metamask', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(mockedSignature);
    });
    test('Validates the recovered address', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedRecoveredAddress);
    });
    test('Normalizes both the current and recovered addresses', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(mockedCurrentAddress);
      expect(addressNormalizer).toHaveBeenCalledWith(mockedRecoveredAddress);
    });
    test('Compares the two addresses and returns', async () => {
      /*
       * Mock the implementation locally to return the same mocked address
       * as the current one
       */
      global.web3.personal.ecRecover.mockImplementation(
        (message, signature, callback) =>
          callback(callbackError, mockedCurrentAddress),
      );
      const validSignature = await verifyMessage(mockedArgumentsObject);
      expect(validSignature).toBeTruthy();
    });
    test('Throws if something goes wrong while recovering', async () => {
      /*
       * Mock it locally to simulate an error
       */
      addressNormalizer.mockImplementation(() => {
        throw new Error();
      });
      expect(verifyMessage(mockedArgumentsObject)).rejects.toThrow();
    });
  });
});
