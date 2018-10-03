import { bigNumberify } from 'ethers/utils';

import { transactionObjectValidator } from '@colony/purser-core/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '@colony/purser-core/normalizers';

import { signTransaction } from '@colony/purser-software/staticMethods';

jest.dontMock('@colony/purser-software/staticMethods');

jest.mock('ethers/utils');
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

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedSignedTransaction = 'mocked-signed-transaction';
const mockedInjectedCallback = jest.fn(transactionObject => {
  if (!transactionObject) {
    throw new Error();
  }
  return mockedSignedTransaction;
});
const chainId = 'mocked-chain-id';
const inputData = 'mocked-data';
const gasLimit = 'mocked-gas-limit';
const gasPrice = 'mocked-gas-price';
const nonce = 'mocked-nonce';
const to = 'mocked-destination-address';
const value = 'mocked-transaction-value';
const mockedTransactionObject = {
  gasPrice,
  gasLimit,
  chainId,
  nonce,
  to,
  value,
  inputData,
};
const mockedArgumentsObject = {
  ...mockedTransactionObject,
  callback: mockedInjectedCallback,
};
describe('`Software` Wallet Module', () => {
  afterEach(() => {
    mockedInjectedCallback.mockClear();
    transactionObjectValidator.mockClear();
    addressNormalizer.mockClear();
    hexSequenceNormalizer.mockClear();
    bigNumberify.mockClear();
  });
  describe('`signTransaction()` static method', () => {
    test('Calls the injected callback', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(mockedInjectedCallback).toHaveBeenCalled();
      expect(mockedInjectedCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          chainId,
          data: inputData,
          gasLimit,
          gasPrice,
          nonce,
          to,
          value,
        }),
      );
    });
    test("Validates the transaction object's values", async () => {
      await signTransaction(mockedArgumentsObject);
      expect(transactionObjectValidator).toHaveBeenCalled();
      expect(transactionObjectValidator).toHaveBeenCalledWith(
        mockedTransactionObject,
      );
    });
    test("Normalizes the transaction object's values before call", async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Destination address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(to);
      /*
       * Transaction data
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(inputData);
    });
    test('Normalizes the signed transaction before returning', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * The signed transaction string
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        mockedSignedTransaction,
      );
    });
    test("Converts numbers to Ethers's version of Big Number", async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Gas price
       */
      expect(bigNumberify).toHaveBeenCalled();
      expect(bigNumberify).toHaveBeenCalledWith(gasPrice);
      /*
       * Gas limit
       */
      expect(bigNumberify).toHaveBeenCalledWith(gasLimit);
      /*
       * Transaction value
       */
      expect(bigNumberify).toHaveBeenCalledWith(value);
    });
    test('Throws if something goes wrong', async () => {
      expect(signTransaction()).rejects.toThrow();
    });
    test("Can be called with no 'to' prop", async () => {
      expect(
        signTransaction({
          gasPrice,
          gasLimit,
          chainId,
          nonce,
          value,
          inputData,
          callback: () => {},
        }),
      ).resolves.not.toThrow();
      /*
       * Since we don't have an address, don't add a destination prop and don't
       * try to normalize it
       */
      expect(addressNormalizer).not.toHaveBeenCalled();
      expect(addressNormalizer).not.toHaveBeenCalledWith(to);
    });
  });
});
