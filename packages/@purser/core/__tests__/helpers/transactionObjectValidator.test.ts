import { mocked } from 'ts-jest/utils';

import { transactionObjectValidator } from '../../src/helpers';
import {
  bigNumberValidator,
  safeIntegerValidator,
  addressValidator,
  hexSequenceValidator,
} from '../../src/validators';
import { bigNumber } from '../../src/utils';
import { TRANSACTION } from '../../src/constants';

jest.mock('../../src/validators');
jest.mock('../../src/utils');

const mockedBigNumberValidator = mocked(bigNumberValidator);
const mockedSafeIntegerValidator = mocked(safeIntegerValidator);
const mockedAddressValidator = mocked(addressValidator);
const mockedHexSequenceValidator = mocked(hexSequenceValidator);
const mockedBigNumber = mocked(bigNumber);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const derivationPath = 'mocked-derivation-path';
const chainId = 1337;
const inputData = 'mocked-data';
const gasLimit = bigNumber(33);
const gasPrice = bigNumber(44);
const nonce = 7;
const to = 'mocked-destination-address';
const value = bigNumber(55);
const mockedTransactionObject = {
  derivationPath,
  gasPrice,
  gasLimit,
  chainId,
  nonce,
  to,
  value,
  inputData,
};

describe('`Core` Module', () => {
  describe('`transactionObjectValidator()` helper', () => {
    afterEach(() => {
      mockedBigNumberValidator.mockClear();
      mockedSafeIntegerValidator.mockClear();
      mockedAddressValidator.mockClear();
      mockedHexSequenceValidator.mockClear();
      mockedBigNumber.mockClear();
    });
    test("Validates all the transaction's object values", async () => {
      transactionObjectValidator(mockedTransactionObject);
      /*
       * Validates gas price and gas limit
       */
      expect(bigNumberValidator).toHaveBeenCalled();
      expect(bigNumberValidator).toHaveBeenCalledWith(gasPrice);
      expect(bigNumberValidator).toHaveBeenCalledWith(gasLimit);
      /*
       * Validates the chain Id
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(chainId);
      /*
       * Validates the nonce
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(nonce);
      /*
       * Validates the destination address
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(to);
      /*
       * Validates the transaction value
       */
      expect(bigNumberValidator).toHaveBeenCalled();
      expect(bigNumberValidator).toHaveBeenCalledWith(value);
      /*
       * Validates the transaction input data
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(inputData);
    });
    test('Returns the validated transaction object', async () => {
      const validatedTransactionObject = transactionObjectValidator(
        mockedTransactionObject,
      );
      expect(validatedTransactionObject).toHaveProperty('gasPrice');
      expect(validatedTransactionObject).toHaveProperty('gasLimit');
      expect(validatedTransactionObject).toHaveProperty('chainId');
      expect(validatedTransactionObject).toHaveProperty('nonce');
      expect(validatedTransactionObject).toHaveProperty('to');
      expect(validatedTransactionObject).toHaveProperty('value');
      expect(validatedTransactionObject).toHaveProperty('inputData');
    });
    test('Has defaults for all object values (except for `to`)', async () => {
      // mockedBigNumber.mockImplementation((number) => bigNumber);
      // @ts-ignore
      const validatedTransactionObject = transactionObjectValidator({});
      expect(validatedTransactionObject.gasPrice.toString()).toEqual(
        TRANSACTION.GAS_PRICE,
      );
      expect(validatedTransactionObject.gasLimit.toString()).toEqual(
        TRANSACTION.GAS_LIMIT,
      );
      expect(validatedTransactionObject).toHaveProperty(
        'chainId',
        TRANSACTION.CHAIN_ID,
      );
      expect(validatedTransactionObject.value.toString()).toEqual(
        TRANSACTION.VALUE,
      );
      expect(validatedTransactionObject).toHaveProperty(
        'inputData',
        TRANSACTION.INPUT_DATA,
      );
    });
    test('Validates destination (to), only if it was provided', async () => {
      transactionObjectValidator({
        gasPrice,
        gasLimit,
        chainId,
        nonce,
        value,
        inputData,
      });
      /*
       * Validates gas price and gas limit
       */
      expect(bigNumberValidator).toHaveBeenCalled();
      expect(bigNumberValidator).toHaveBeenCalledWith(gasPrice);
      expect(bigNumberValidator).toHaveBeenCalledWith(gasLimit);
      /*
       * Validates the chain Id
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(chainId);
      /*
       * Validates the nonce
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(nonce);
      /*
       * Validates the transaction value
       */
      expect(bigNumberValidator).toHaveBeenCalled();
      expect(bigNumberValidator).toHaveBeenCalledWith(value);
      /*
       * Validates the transaction input data
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(inputData);
      /*
       * Doesn't validates the destination address, since it wasn't provided
       */
      expect(addressValidator).not.toHaveBeenCalled();
      expect(addressValidator).not.toHaveBeenCalledWith(to);
    });
    test('Validates nonce, only if one was provided', async () => {
      transactionObjectValidator({
        gasPrice,
        gasLimit,
        chainId,
        value,
        inputData,
      });
      /*
       * Validates gas price and gas limit
       */
      expect(bigNumberValidator).toHaveBeenCalled();
      expect(bigNumberValidator).toHaveBeenCalledWith(gasPrice);
      expect(bigNumberValidator).toHaveBeenCalledWith(gasLimit);
      /*
       * Validates the chain Id
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(chainId);
      /*
       * Validates the transaction value
       */
      expect(bigNumberValidator).toHaveBeenCalled();
      expect(bigNumberValidator).toHaveBeenCalledWith(value);
      /*
       * Validates the transaction input data
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(inputData);
      /*
       * Doesn't validates the nonce, since it wasn't provided
       */
      expect(safeIntegerValidator).not.toHaveBeenCalledWith(nonce);
    });
  });
});
