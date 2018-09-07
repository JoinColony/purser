import { transactionObjectValidator } from '@colony/purser-core/helpers';
import {
  bigNumberValidator,
  safeIntegerValidator,
  addressValidator,
  hexSequenceValidator,
} from '@colony/purser-core/validators';
import { bigNumber } from '@colony/purser-core/utils';

import { TRANSACTION } from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-core/helpers');

jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils.js'),
);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const derivationPath = 'mocked-derivation-path';
const chainId = 'mocked-chain-id';
const inputData = 'mocked-data';
const gasLimit = 'mocked-gas-limit';
const gasPrice = 'mocked-gas-price';
const nonce = 'mocked-nonce';
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
      bigNumber.mockImplementation(number => number);
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
  });
});
