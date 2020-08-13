import { mocked } from 'ts-jest/utils';
import { Web3Provider } from 'ethers/providers/web3-provider';
import { bigNumberify } from 'ethers/utils';

import { STD_ERRORS } from '../../src/constants';
import { staticMethods as messages } from '../../src/messages';
import { methodCaller } from '../../src/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../core/src/normalizers';
import {
  addressValidator,
  safeIntegerValidator,
  hexSequenceValidator,
} from '../../../core/src/validators';

import { warning } from '../../../core/src/utils';
import {
  getChainDefinition,
  transactionObjectValidator,
} from '../../../core/src/helpers';

import { signTransaction } from '../../src/staticMethods';

jest.mock('../../../core/src/validators');
jest.mock('../../../core/src/helpers');
jest.mock('../../../core/src/normalizers');
jest.mock('../../../core/src/utils');
jest.mock('../../src/helpers');

const chainId = 5;

const mockedProvider = new Web3Provider(null);

const mockedMethodCaller = mocked(methodCaller);
const mockedTranactionObjectValidator = mocked(transactionObjectValidator);
const mockedAddressValidator = mocked(addressValidator);
const mockedSafeIntegerValidator = mocked(safeIntegerValidator);
const mockedHexSequenceValidator = mocked(hexSequenceValidator);
const mockedGetChainDefinition = mocked(getChainDefinition);
const mockedWarning = mocked(warning);
const mockedAddressNormalizer = mocked(addressNormalizer);
const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedAddress = 'mocked-address';
const data = 'mocked-data';
const gasLimit = bigNumberify(22);
const gasPrice = bigNumberify(33);
const nonce = 42;
const to = 'mocked-destination-address';
const value = bigNumberify(5);
const mockedTransactionObject = {
  gasPrice,
  gasLimit,
  to,
  chainId,
  value,
  data,
  nonce,
};
const mockedArgumentsObject = {
  ...mockedTransactionObject,
  from: mockedAddress,
};

describe('`Metamask` Wallet Module Static Methods', () => {
  afterEach(() => {
    mockedMethodCaller.mockClear();
    mockedTranactionObjectValidator.mockClear();
    mockedAddressValidator.mockClear();
    mockedSafeIntegerValidator.mockClear();
    mockedHexSequenceValidator.mockClear();
    mockedGetChainDefinition.mockClear();
    mockedWarning.mockClear();
    mockedAddressNormalizer.mockClear();
    mockedHexSequenceNormalizer.mockClear();
  });
  describe('`signTransaction()` static method', () => {
    test('Calls the correct metamask injected method', async () => {
      const mockedSigner = mocked(mockedProvider.getSigner());
      await signTransaction(mockedProvider, mockedArgumentsObject);
      expect(mockedSigner.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          chainId,
          gasPrice,
          gasLimit,
          data,
          to,
          value,
        }),
      );
    });
    test('Detects if the injected proxy is avaialable', async () => {
      await signTransaction(mockedProvider, mockedArgumentsObject);
      expect(methodCaller).toHaveBeenCalled();
    });
    test('Throws if no argument provided', async () => {
      // @ts-ignore
      await expect(signTransaction()).rejects.toThrow();
    });
    test('Warns if the nonce was individually set', async () => {
      await signTransaction(mockedProvider, {
        ...mockedArgumentsObject,
        nonce,
      });
      expect(warning).toHaveBeenCalled();
    });
    test('Validates the transaction hash received from signing', async () => {
      await signTransaction(mockedProvider, mockedArgumentsObject);
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith('0xcabcab');
    });
    test('Normalizes the transaction hash received from signing', async () => {
      await signTransaction(mockedProvider, mockedArgumentsObject);
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith('0xcabcab');
    });
    test('Returns the valid hash received from signing', async () => {
      const mockedSigner = mocked(mockedProvider.getSigner());
      const signedTransaction = await signTransaction(
        mockedProvider,
        mockedArgumentsObject,
      );
      expect(mockedSigner.sendTransaction).toHaveBeenCalled();
      expect(signedTransaction).toEqual('0xcabcab');
    });
    test('Throws if something goes wrong while signing the transaction', async () => {
      /*
       * Mock ethers' `sendTransaction` method locally to simulate a generic error while signing
       */
      const mockedSigner = mocked(mockedProvider.getSigner());
      mockedSigner.sendTransaction.mockImplementationOnce(() => {
        throw new Error('generic sendTransaction error');
      });
      await expect(
        signTransaction(mockedProvider, mockedArgumentsObject),
      ).rejects.toHaveProperty('message', 'generic sendTransaction error');
    });
    test('Throws if the user cancelled signing the transaction', async () => {
      /*
       * Mock ethers' `sendTransaction` method locally to simulate cancelling signing
       */
      const mockedSigner = mocked(mockedProvider.getSigner());
      mockedSigner.sendTransaction.mockImplementationOnce(() => {
        throw new Error(STD_ERRORS.CANCEL_TX_SIGN);
      });
      await expect(
        signTransaction(mockedProvider, mockedArgumentsObject),
      ).rejects.toHaveProperty('message', messages.cancelTransactionSign);
    });
  });
});
