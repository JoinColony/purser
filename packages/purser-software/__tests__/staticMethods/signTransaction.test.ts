import { bigNumberify } from 'ethers/utils';
import { mocked } from 'ts-jest/utils';

import { bigNumber } from '../../../purser-core/src/utils';
import { transactionObjectValidator } from '../../../purser-core/src/helpers';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../purser-core/src/normalizers';

import { signTransaction } from '../../src/staticMethods';

jest.mock('ethers/utils');
jest.mock('../../../purser-core/src/helpers');
jest.mock('../../../purser-core/src/normalizers');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedSignedTransaction = 'mocked-signed-transaction';
const mockedInjectedCallback = jest.fn((transactionObject) => {
  if (!transactionObject) {
    throw new Error();
  }
  return mockedSignedTransaction;
});
const chainId = 1337;
const inputData = 'mocked-data';
const gasLimit = '22';
const gasPrice = '33';
const nonce = 1;
const to = 'mocked-destination-address';
const value = '1337';
const mockedTransactionObject = {
  gasPrice: bigNumber(gasPrice),
  gasLimit: bigNumber(gasLimit),
  chainId,
  nonce,
  to,
  value: bigNumber(value),
  inputData,
};
const mockedArgumentsObject = {
  ...mockedTransactionObject,
  callback: mockedInjectedCallback,
};
describe('`Software` Wallet Module', () => {
  afterEach(() => {
    mockedInjectedCallback.mockClear();
    mocked(transactionObjectValidator).mockClear();
    mocked(addressNormalizer).mockClear();
    mocked(hexSequenceNormalizer).mockClear();
    mocked(bigNumberify).mockClear();
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
      // @ts-ignore
      await expect(signTransaction()).rejects.toThrow();
    });
    test("Can be called with no 'to' prop", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { to: _, ...txWithouTo } = mockedTransactionObject;
      await expect(
        signTransaction({
          ...txWithouTo,
          callback: () => 'foo',
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
