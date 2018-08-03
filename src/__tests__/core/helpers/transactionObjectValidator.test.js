import { transactionObjectValidator } from '../../../core/helpers';
import {
  derivationPathValidator,
  bigNumberValidator,
  safeIntegerValidator,
  addressValidator,
  hexSequenceValidator,
} from '../../../core/validators';
import { derivationPathNormalizer } from '../../../core/normalizers';

jest.dontMock('../../../core/helpers');

jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');

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
       * Validates the derivation path
       */
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(derivationPath);
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
    test('Normalizes the derivation path', async () => {
      transactionObjectValidator(mockedTransactionObject);
      /*
       * Normalizes the derivation path
       */
      expect(derivationPathNormalizer).toHaveBeenCalled();
      expect(derivationPathNormalizer).toHaveBeenCalledWith(derivationPath);
    });
    test('Returns the validated transaction object', async () => {
      const validatedTransactionObject = transactionObjectValidator(
        mockedTransactionObject,
      );
      expect(validatedTransactionObject).toHaveProperty('derivationPath');
      expect(validatedTransactionObject).toHaveProperty('gasPrice');
      expect(validatedTransactionObject).toHaveProperty('gasLimit');
      expect(validatedTransactionObject).toHaveProperty('chainId');
      expect(validatedTransactionObject).toHaveProperty('nonce');
      expect(validatedTransactionObject).toHaveProperty('to');
      expect(validatedTransactionObject).toHaveProperty('value');
      expect(validatedTransactionObject).toHaveProperty('inputData');
    });
  });
});
