import { mocked } from 'ts-jest/utils';
import { Web3Provider } from 'ethers/providers/web3-provider';

import { warning } from '../../../purser-core/src/utils';
import { hexSequenceNormalizer } from '../../../purser-core/src/normalizers';
import {
  addressValidator,
  messageValidator,
  hexSequenceValidator,
} from '../../../purser-core/src/validators';
import { messageOrDataValidator } from '../../../purser-core/src/helpers';

import { signMessage } from '../../src/staticMethods';
import { staticMethods as messages } from '../../src/messages';
import { methodCaller } from '../../src/helpers';

import { STD_ERRORS } from '../../src/constants';

jest.mock('../../../purser-core/src/validators');
jest.mock('../../../purser-core/src/helpers');
jest.mock('../../../purser-core/src/normalizers');
jest.mock('../../../purser-core/src/utils');
jest.mock('../../src/helpers');

const mockedProvider = new Web3Provider(null);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedAddress = 'mocked-address';
const mockedMessage = 'mocked-message';
const mockedArgumentsObject = {
  message: mockedMessage,
  currentAddress: mockedAddress,
  messageData: '',
};

const mockedBufferFrom = jest.spyOn(Buffer, 'from');
const mockedMethodCaller = mocked(methodCaller);
const mockedAddressValidator = mocked(addressValidator);
const mockedMessageValidator = mocked(messageValidator);
const mockedHexSequenceValidator = mocked(hexSequenceValidator);
const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);
const mockedWarning = mocked(warning);

describe('`Metamask` Wallet Module Static Methods', () => {
  afterEach(() => {
    mockedBufferFrom.mockClear();
    mockedMethodCaller.mockClear();
    mockedAddressValidator.mockClear();
    mockedMessageValidator.mockClear();
    mockedHexSequenceValidator.mockClear();
    mockedHexSequenceNormalizer.mockClear();
    mockedWarning.mockClear();
  });
  describe('`signMessage()` static method', () => {
    test('Calls the correct metamask injected method', async () => {
      const mockedSigner = mocked(mockedProvider.getSigner());
      await signMessage(mockedProvider, mockedArgumentsObject);
      expect(mockedSigner.signMessage).toHaveBeenCalledWith(mockedMessage);
    });
    test('Detects if the injected proxy is avaialable', async () => {
      await signMessage(mockedProvider, mockedArgumentsObject);
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
      mockedAddressValidator.mockImplementation((value) => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      // @ts-ignore
      await expect(signMessage()).rejects.toThrow();
    });
    test('Validates the `currentAddress` individually', async () => {
      await signMessage(mockedProvider, mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedAddress);
    });
    test('Validates the `message` string individually', async () => {
      await signMessage(mockedProvider, mockedArgumentsObject);
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
      await signMessage(mockedProvider, mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith('0xccccc');
    });
    test('Validates the returned message signature', async () => {
      await signMessage(mockedProvider, mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith('0xccccc');
    });
    test('Normalizes the message signature before returning', async () => {
      await signMessage(mockedProvider, mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith('0xccccc');
    });
    test('Returns the message signature', async () => {
      const messageSignature = await signMessage(
        mockedProvider,
        mockedArgumentsObject,
      );
      expect(messageSignature).toEqual('0xccccc');
    });
    test('Throws if something goes wrong while signing the message', async () => {
      /*
       * Mock ethers' `sendTransaction` method locally to simulate a generic error while signing
       */
      const mockedSigner = mocked(mockedProvider.getSigner());
      mockedSigner.signMessage.mockImplementationOnce(() => {
        throw new Error('generic sign error');
      });
      await expect(
        signMessage(mockedProvider, mockedArgumentsObject),
      ).rejects.toHaveProperty('message', 'generic sign error');
    });
    test('Throws if the user cancelled signing the message', async () => {
      /*
       * Mock ethers' `sendTransaction` method locally to simulate cancelling signing
       */
      const mockedSigner = mocked(mockedProvider.getSigner());
      mockedSigner.signMessage.mockImplementationOnce(() => {
        throw new Error(STD_ERRORS.CANCEL_MSG_SIGN);
      });
      await expect(
        signMessage(mockedProvider, mockedArgumentsObject),
      ).rejects.toHaveProperty('message', messages.cancelMessageSign);
    });
  });
});
