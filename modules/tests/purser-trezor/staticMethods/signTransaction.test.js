import { Transaction as EthereumTx } from 'ethereumjs-tx';

import {
  getChainDefinition,
  transactionObjectValidator,
} from '@colony/purser-core/helpers';
import * as utils from '@colony/purser-core/utils';

import { signTransaction } from '@colony/purser-trezor/staticMethods';
import { staticMethods as messages } from '@colony/purser-trezor/messages';
import { payloadListener } from '@colony/purser-trezor/helpers';
import {
  derivationPathNormalizer,
  bigNumberToHexString,
  addressNormalizer,
  hexSequenceNormalizer,
} from '@colony/purser-core/normalizers';
import { derivationPathValidator } from '@colony/purser-core/validators';

import { PAYLOAD_SIGNTX } from '@colony/purser-trezor/payloads';
import { STD_ERRORS } from '@colony/purser-trezor/defaults';

jest.dontMock('@colony/purser-trezor/staticMethods');

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
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers'),
);
jest.mock('@colony/purser-trezor/helpers', () =>
  require('@mocks/purser-trezor/helpers'),
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

describe('`Trezor` Hardware Wallet Module Static Methods', () => {
  afterEach(() => {
    derivationPathNormalizer.mockClear();
    bigNumberToHexString.mockClear();
    addressNormalizer.mockClear();
    hexSequenceNormalizer.mockClear();
    getChainDefinition.mockClear();
    utils.warning.mockClear();
    payloadListener.mockClear();
    derivationPathValidator.mockClear();
  });
  describe('`signTransaction()` static method', () => {
    test('Creates the initial, unsigned signature', async () => {
      await signTransaction(mockedArgumentsObject);
      expect(EthereumTx).toHaveBeenCalled();
      expect(EthereumTx).toHaveBeenCalledWith(
        {
          gasPrice,
          gasLimit,
          nonce,
          value,
          data: inputData,
        },
        { common: { chainId: 'mocked-chain-id' } },
      );
    });
    test('Uses the correct trezor service payload type', async () => {
      const { type, requiredFirmware } = PAYLOAD_SIGNTX;
      await signTransaction(mockedArgumentsObject);
      expect(payloadListener).toHaveBeenCalled();
      expect(payloadListener).toHaveBeenCalledWith({
        /*
         * We only care about what payload type this method sends
         */
        payload: expect.objectContaining({
          type,
          requiredFirmware,
        }),
      });
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
    test('Validates the derivation path individually', async () => {
      await signTransaction(mockedArgumentsObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(derivationPath);
      /*
       * So it throws if you don't provide one
       */
      expect(signTransaction()).rejects.toThrow();
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
      expect(bigNumberToHexString).toHaveBeenCalled();
      expect(bigNumberToHexString).toHaveBeenCalledWith(gasPrice);
      expect(bigNumberToHexString).toHaveBeenCalledWith(gasLimit);
      /*
       * Normalizes the nonce
       */
      expect(bigNumberToHexString).toHaveBeenCalled();
      expect(bigNumberToHexString).toHaveBeenCalledWith(nonce);
      /*
       * Normalizes the destination address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(to, false);
      /*
       * Normalizes the transaction value
       */
      expect(bigNumberToHexString).toHaveBeenCalled();
      expect(bigNumberToHexString).toHaveBeenCalledWith(value);
      /*
       * Normalizes the transaction input data
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(inputData, false);
    });
    test('Catches is something goes wrong along the way', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error from one of the method
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error('Oh no!')),
      );
      expect(signTransaction(mockedArgumentsObject)).rejects.toHaveProperty(
        'message',
        expect.stringContaining('Oh no!'),
      );
    });
    test('Throws if the user cancels signing it', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a cancel response.
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error(STD_ERRORS.CANCEL_TX_SIGN)),
      );
      expect(signTransaction(mockedTransactionObject)).rejects.toHaveProperty(
        'message',
        messages.userSignTxCancel,
      );
    });
    test('Signs a transaction without a destination address', async () => {
      payloadListener.mockImplementation(() => ({
        signature: 'mocked-signature',
      }));
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
