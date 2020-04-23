import { warning } from '@colony/purser-core/utils';

import { signMessage } from '@colony/purser-metamask/staticMethods';
import { staticMethods as messages } from '@colony/purser-metamask/messages';
import { methodCaller } from '@colony/purser-metamask/helpers';
import { hexSequenceNormalizer } from '@colony/purser-core/normalizers';
import {
  addressValidator,
  messageValidator,
  hexSequenceValidator,
} from '@colony/purser-core/validators';
import { messageOrDataValidator } from '@colony/purser-core/helpers';

import { STD_ERRORS } from '@colony/purser-metamask/defaults';

jest.dontMock('@colony/purser-metamask/staticMethods');

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
jest.mock('@colony/purser-metamask/helpers', () =>
  require('@mocks/purser-metamask/helpers'),
);

/*
 * Mock the injected web3 proxy object
 */
const mockedMessageSignature = 'mocked-message-signature';
global.web3 = {
  eth: {
    personal: {
      sign: jest.fn((message, address, callback) =>
        callback(undefined, mockedMessageSignature),
      ),
    },
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
    global.web3.eth.personal.sign.mockClear();
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
      expect(global.web3.eth.personal.sign).toHaveBeenCalled();
      expect(global.web3.eth.personal.sign).toHaveBeenCalledWith(
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
      expect(messageOrDataValidator).toHaveBeenCalled();
      expect(messageOrDataValidator).toHaveBeenCalledWith(
        expect.objectContaining({
          message: mockedMessage,
        }),
      );
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
       * Mock it locally to simulate an error in the sign callback
       */
      hexSequenceValidator.mockImplementation(() => {
        throw new Error('hex sequence validator error');
      });
      expect(signMessage(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        'hex sequence validator error',
      );
    });
    test('Throws if something goes wrong while signing the message', async () => {
      /*
       * Mock web3's `sign` method locally to simulate a generic error while signing
       */
      global.web3.eth.personal.sign.mockImplementation(
        (message, address, callback) =>
          callback(new Error('generic sign error')),
      );
      expect(signMessage(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        'generic sign error',
      );
    });
    test('Throws if the user cancelled signing the message', async () => {
      /*
       * Mock web3's `sign` method locally to simulate the user cancelling signing
       */
      global.web3.eth.personal.sign.mockImplementation(
        (message, address, callback) =>
          callback(
            new Error(STD_ERRORS.CANCEL_MSG_SIGN),
            mockedMessageSignature,
          ),
      );
      expect(signMessage(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        messages.cancelMessageSign,
      );
    });
  });
});
