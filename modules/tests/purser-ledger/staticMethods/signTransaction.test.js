import EthereumTx from 'ethereumjs-tx';

import { transactionObjectValidator } from '@colony/purser-core/helpers';
import * as utils from '@colony/purser-core/utils';

import { signTransaction } from '@colony/purser-ledger/staticMethods';
import {
  ledgerConnection,
  handleLedgerConnectionError,
} from '@colony/purser-ledger/helpers';
import {
  derivationPathNormalizer,
  multipleOfTwoHexValueNormalizer,
  addressNormalizer,
  hexSequenceNormalizer,
} from '@colony/purser-core/normalizers';
import { derivationPathValidator } from '@colony/purser-core/validators';

import { SIGNATURE } from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-ledger/staticMethods');

jest.mock('ethereumjs-tx');
jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils.js'),
);
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers.js'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers.js'),
);
jest.mock('@colony/purser-ledger/helpers', () =>
  require('@mocks/purser-ledger/helpers.js'),
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
  derivationPath,
};

describe('`Ledger` Hardware Wallet Module Static Methods', () => {
  afterEach(() => {
    EthereumTx.mockClear();
    derivationPathNormalizer.mockClear();
    multipleOfTwoHexValueNormalizer.mockClear();
    addressNormalizer.mockClear();
    hexSequenceNormalizer.mockClear();
    ledgerConnection.mockClear();
    handleLedgerConnectionError.mockClear();
    transactionObjectValidator.mockClear();
    derivationPathValidator.mockClear();
    utils.warning.mockClear();
  });
  describe('`signTransaction()` static method', () => {
    test('Calls the correct ledger app method', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(ledgerConnection.signTransaction).toHaveBeenCalled();
      expect(ledgerConnection.signTransaction).toHaveBeenCalledWith(
        /*
        * We only care if the derivation path is "correct"
        */
        derivationPath,
        expect.any(String),
      );
    });
    test('Validates the transaction input values', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(transactionObjectValidator).toHaveBeenCalled();
      expect(transactionObjectValidator).toHaveBeenCalledWith(
        mockedTransactionObject,
      );
    });
    test('Validates the derivation path individually', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(derivationPath);
    });
    test('Normalizes the transaction input values', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Normalizes the derivation path
       */
      expect(derivationPathNormalizer).toHaveBeenCalled();
      expect(derivationPathNormalizer).toHaveBeenCalledWith(derivationPath);
      /*
       * Normalizes gas price and gas limit
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(gasPrice);
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(gasPrice);
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(gasLimit);
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(gasLimit);
      /*
       * Normalizes the nonce
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(nonce);
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(nonce);
      /*
       * Normalizes the destination address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(to);
      /*
       * Normalizes the transaction value
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(value);
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(value);
      /*
       * Normalizes the transaction input data
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(inputData);
      /*
       * Normalizes the seeded R,S and V signature components
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(String(SIGNATURE.R));
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(
        String(SIGNATURE.R),
      );
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(String(SIGNATURE.S));
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(
        String(SIGNATURE.S),
      );
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(chainId);
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(chainId);
    });
    test('Warns the user to check/confirm the device', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the warning util
       */
      expect(utils.warning).toHaveBeenCalled();
    });
    test('Creates the unsigned transaction object', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Creates the unsigned transaction, seeding the R,S and V components
       */
      expect(EthereumTx).toHaveBeenCalled();
      expect(EthereumTx).toHaveBeenCalledWith(
        expect.objectContaining({
          gasPrice,
          gasLimit,
          chainId,
          nonce,
          to,
          value,
          data: inputData,
          r: String(SIGNATURE.R),
          s: String(SIGNATURE.S),
          v: chainId,
        }),
      );
    });
    test('Normalizes the signed transaction signature components', async () => {
      const {
        r: rSignatureComponent,
        s: sSignatureComponent,
        v: recoveryParameter,
      } = ledgerConnection.signTransaction();
      await signTransaction(mockedTransactionObject);
      /*
       * Normalizes the signature components, returned after signing the
       * transaction object (bufffer)
       */
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(rSignatureComponent);
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(sSignatureComponent);
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(recoveryParameter);
    });
    test('Catches is something goes wrong along the way', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error along the way
       */
      ledgerConnection.mockRejectedValueOnce(new Error());
      await signTransaction();
      /*
       * Handles the specific transport error
       */
      expect(handleLedgerConnectionError).toHaveBeenCalled();
    });
    test('Signs a transaction without a destination address', async () => {
      expect(
        signTransaction({
          gasPrice,
          gasLimit,
          chainId,
          nonce,
          value,
          inputData,
        }),
      ).resolves.not.toThrow();
      expect(addressNormalizer).not.toHaveBeenCalled();
    });
  });
});
