import { Transaction as EthereumTx } from 'ethereumjs-tx';
import {
  getChainDefinition,
  transactionObjectValidator,
} from '@colony/purser-core/helpers';
import { warning } from '@colony/purser-core/utils';

import { signTransaction } from '@colony/purser-metamask/staticMethods';
import { staticMethods as messages } from '@colony/purser-metamask/messages';
import { methodCaller } from '@colony/purser-metamask/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '@colony/purser-core/normalizers';
import {
  addressValidator,
  safeIntegerValidator,
  hexSequenceValidator,
} from '@colony/purser-core/validators';

import { STD_ERRORS } from '@colony/purser-metamask/defaults';
import { SIGNATURE } from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-metamask/staticMethods');

jest.mock('ethereumjs-tx');
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

const chainId = 5;

/*
 * Mock the injected web3 proxy object
 */
const mockedTransactionHash = 'mocked-transaction-hash';
const mockedRawSignedTransaction = {
  gas: '1000',
  gasPrice: '1',
  input: 'mocked-signed-data',
  nonce: '10',
  r: SIGNATURE.R,
  s: SIGNATURE.S,
  to: 'mocked-signed-to',
  v: SIGNATURE.RECOVERY_EVEN,
  value: '0',
};
global.web3 = {
  eth: {
    sendTransaction: jest.fn((transactionObject, callback) =>
      callback(undefined, mockedTransactionHash),
    ),
    getTransaction: jest.fn(() => Promise.resolve(mockedRawSignedTransaction)),
    getTransactionReceipt: jest.fn(),
  },
};

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedAddress = 'mocked-address';
const inputData = 'mocked-data';
const gasLimit = 'mocked-gas-limit';
const gasPrice = 'mocked-gas-price';
const nonce = 'mocked-nonce';
const to = 'mocked-destination-address';
const value = 'mocked-transaction-value';
const mockedTransactionObject = {
  gasPrice,
  gasLimit,
  to,
  chainId,
  value,
  inputData,
};
const mockedArgumentsObject = {
  ...mockedTransactionObject,
  from: mockedAddress,
};

describe('`Metamask` Wallet Module Static Methods', () => {
  afterEach(() => {
    global.web3.eth.sendTransaction.mockClear();
    global.web3.eth.getTransaction.mockClear();
    methodCaller.mockClear();
    transactionObjectValidator.mockClear();
    addressValidator.mockClear();
    safeIntegerValidator.mockClear();
    hexSequenceValidator.mockClear();
    getChainDefinition.mockClear();
    warning.mockClear();
    addressNormalizer.mockClear();
    hexSequenceNormalizer.mockClear();
  });
  describe('`signTransaction()` static method', () => {
    test('Calls the correct metamask injected method', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(global.web3.eth.sendTransaction).toHaveBeenCalled();
      expect(global.web3.eth.sendTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          from: mockedAddress,
          gasPrice,
          gas: gasLimit,
          data: inputData,
          to,
          value,
        }),
        expect.any(Function),
      );
    });
    test('Detects if the injected proxy is avaialable', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(methodCaller).toHaveBeenCalled();
    });
    test('Validates the transaction object', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(transactionObjectValidator).toHaveBeenCalled();
      expect(transactionObjectValidator).toHaveBeenCalledWith(
        mockedTransactionObject,
      );
    });
    test('Gets the correct chain definition', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the chain definition helper with the correct value
       */
      expect(getChainDefinition).toHaveBeenCalled();
      expect(getChainDefinition).toHaveBeenCalledWith(
        mockedTransactionObject.chainId,
      );
    });
    test('Throws if no argument provided', async () => {
      expect(signTransaction()).rejects.toThrow();
    });
    test('Validates the `from` address individually', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedAddress);
    });
    test('Validates the nonce individually (if set)', async () => {
      await signTransaction({
        ...mockedArgumentsObject,
        nonce,
      });
      /*
       * Calls the validation helper with the correct values
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(nonce);
      /*
       * And also warns the user about manually setting a nonce
       */
      expect(warning).toHaveBeenCalled();
    });
    test('And ignores the nonce if not set', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Does not try to validate the nonce
       */
      expect(safeIntegerValidator).not.toHaveBeenCalled();
      /*
       * Also does NOT warn the user
       */
      expect(warning).not.toHaveBeenCalled();
    });
    test('Normalizes some of the transaction input values', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Normalizes the sender's (your) address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(mockedAddress);
      /*
       * Also Normalizes the destination addressw
       */
      expect(addressNormalizer).toHaveBeenCalledWith(to);
      /*
       * Normalizes the transaction input data
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(inputData);
    });
    test('Validates the transaction hash received from signing', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(mockedTransactionHash);
    });
    test('Normalizes the transaction hash received from signing', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(mockedTransactionHash);
    });
    test('Creates the unsigned transaction object', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Creates the unsigned transaction, seeding the R,S and V components
       */
      expect(EthereumTx).toHaveBeenCalled();
      expect(EthereumTx).toHaveBeenCalledWith(
        {
          data: mockedRawSignedTransaction.input,
          r: mockedRawSignedTransaction.r,
          s: mockedRawSignedTransaction.s,
          v: mockedRawSignedTransaction.v,
          to: mockedRawSignedTransaction.to,
          gasLimit: expect.anything(),
          gasPrice: expect.anything(),
          nonce: expect.anything(),
          value: expect.anything(),
        },
        { common: { chainId: 'mocked-chain-id' } },
      );
    });
    test('Returns the valid hash received from signing', async () => {
      const signedTransaction = await signTransaction(mockedArgumentsObject);
      expect(global.web3.eth.getTransaction).toHaveBeenCalled();
      expect(signedTransaction).toEqual('mocked-serialized-signed-transaction');
    });
    test('Throws if something goes wrong while processing the signed transaction', async () => {
      /*
       * Mock it locally to simulate an error in the sendTransaction callback
       */
      hexSequenceValidator.mockImplementation(() => {
        throw new Error('hex sequence validator error');
      });
      expect(signTransaction(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        'hex sequence validator error',
      );
    });
    test('Throws if something goes wrong while signing the transaction', async () => {
      /*
       * Mock web3's `sendTransaction` method locally to simulate a generic error while signing
       */
      global.web3.eth.sendTransaction.mockImplementation(
        (transactionObject, callback) =>
          callback(new Error('generic sendTransaction error')),
      );
      expect(signTransaction(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        'generic sendTransaction error',
      );
    });
    test('Throws if the user cancelled signing the transaction', async () => {
      /*
       * Mock web3's `sendTransaction` method locally to simulate cancelling signing
       */
      global.web3.eth.sendTransaction.mockImplementation(
        (transactionObject, callback) =>
          callback(new Error(STD_ERRORS.CANCEL_TX_SIGN), mockedTransactionHash),
      );
      expect(signTransaction(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        messages.cancelTransactionSign,
      );
    });
  });
});
