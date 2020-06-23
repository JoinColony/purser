import { mocked } from 'ts-jest/utils';
import * as utils from 'ethers/utils';
import { messageVerificationObjectValidator } from '../../../purser-core/src/helpers';

import { methodCaller } from '../../src/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../purser-core/src/normalizers';
import {
  addressValidator,
  hexSequenceValidator,
} from '../../../purser-core/src/validators';
import { verifyMessage } from '../../src/staticMethods';

jest.mock('../../../purser-core/src/validators');
jest.mock('../../../purser-core/src/helpers');
jest.mock('../../../purser-core/src/normalizers');
jest.mock('../../../purser-core/src/utils');
jest.mock('../../src/helpers');

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

const mockedMethodCaller = mocked(methodCaller);
const mockedAddressValidator = mocked(addressValidator);
const mockedHexSequenceValidator = mocked(hexSequenceValidator);
const mockedAddressNormalizer = mocked(addressNormalizer);
const mockedMessageVerificationObjectValidator = mocked(
  messageVerificationObjectValidator,
);

describe('`Metamask` Wallet Module Static Methods', () => {
  afterEach(() => {
    mockedMethodCaller.mockClear();
    mockedMessageVerificationObjectValidator.mockClear();
    mockedAddressValidator.mockClear();
    mockedHexSequenceValidator.mockClear();
    mockedAddressNormalizer.mockClear();
  });
  describe('`verifyMessage()` static method', () => {
    test('Calls the ethers method', async () => {
      const spy = jest.spyOn(utils, 'verifyMessage');
      await verifyMessage(mockedArgumentsObject);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(mockedMessage, mockedSignature);
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
      mockedAddressValidator.mockImplementation((value) => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      // @ts-ignore
      await expect(verifyMessage()).rejects.toThrow();
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
      expect(addressNormalizer).toHaveBeenCalledWith(mockedCurrentAddress);
      expect(addressNormalizer).toHaveBeenCalledWith(
        'mocked-recovered-address',
      );
    });
    test('Normalizes both the current and recovered addresses', async () => {
      await verifyMessage(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(
        'mocked-recovered-address',
      );
      expect(addressNormalizer).toHaveBeenCalledWith(mockedCurrentAddress);
    });
    test('Compares the two addresses and returns', async () => {
      /*
       * Mock the implementation locally to return the same mocked address
       * as the current one
       */
      jest
        .spyOn(utils, 'verifyMessage')
        .mockImplementationOnce(() => mockedCurrentAddress);
      const validSignature = await verifyMessage(mockedArgumentsObject);
      expect(validSignature).toBeTruthy();

      /*
       * Mock the implementation locally to return the a different mocked address
       * to the current one
       */
      jest
        .spyOn(utils, 'verifyMessage')
        .mockImplementationOnce(() => 'another-address');
      const invalidSignature = await verifyMessage(mockedArgumentsObject);
      expect(invalidSignature).toBeFalsy();
    });
    test('Throws if something goes wrong while processing the result of recovering', async () => {
      /*
       * Mock it locally to simulate an error for the verify callback
       */
      mockedAddressNormalizer.mockImplementation(() => {
        throw new Error('address normalizer error');
      });
      await expect(verifyMessage(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        'address normalizer error',
      );
    });
    test('Throws if something goes wrong while recovering', async () => {
      /*
       * Mock eterhs' `verifyMessage` method locally to simulate a generic error while recovering
       */
      jest.spyOn(utils, 'verifyMessage').mockImplementationOnce(() => {
        throw new Error('generic ecRecover error');
      });
      await expect(verifyMessage(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        'generic ecRecover error',
      );
    });
  });
});
