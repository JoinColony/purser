import { jestMocked } from '../../../testutils';

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

const mockedBigNumberValidator = jestMocked(bigNumberValidator);
const mockedSafeIntegerValidator = jestMocked(safeIntegerValidator);
const mockedAddressValidator = jestMocked(addressValidator);
const mockedHexSequenceValidator = jestMocked(hexSequenceValidator);
const mockedBigNumber = jestMocked(bigNumber);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const derivationPath = 'mocked-derivation-path';
const chainId = 1337;
const inputData = 'mocked-data';
const gasLimit = 'mocked-gas-limit';
const gasPrice = 'mocked-gas-price';
const nonce = 7;
const to = 'mocked-destination-address';
const value = 'mocked-transaction-value';
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
      mockedBigNumber.mockImplementation((number) => number);
      const validatedTransactionObject = transactionObjectValidator();
      expect(validatedTransactionObject).toHaveProperty(
        'gasPrice',
        TRANSACTION.GAS_PRICE,
      );
      expect(validatedTransactionObject).toHaveProperty(
        'gasLimit',
        TRANSACTION.GAS_LIMIT,
      );
      expect(validatedTransactionObject).toHaveProperty(
        'chainId',
        TRANSACTION.CHAIN_ID,
      );
      expect(validatedTransactionObject).toHaveProperty(
        'nonce',
        TRANSACTION.NONCE,
      );
      expect(validatedTransactionObject).toHaveProperty(
        'value',
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
  });
});
