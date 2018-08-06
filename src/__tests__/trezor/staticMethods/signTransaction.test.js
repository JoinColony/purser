import EthereumTx from 'ethereumjs-tx';

import { transactionObjectValidator } from '../../../core/helpers';
import * as utils from '../../../core/utils';

import { signTransaction } from '../../../trezor/staticMethods';
import { payloadListener } from '../../../trezor/helpers';
import {
  derivationPathNormalizer,
  multipleOfTwoHexValueNormalizer,
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../../core/normalizers';

import { PAYLOAD_SIGNTX } from '../../../trezor/payloads';
import { STD_ERRORS } from '../../../trezor/defaults';

jest.dontMock('../../../trezor/staticMethods');

jest.mock('ethereumjs-tx');
jest.mock('../../../core/validators');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/utils');
jest.mock('../../../core/helpers');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../trezor/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../trezor/__remocks__/helpers'),
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

describe('`Trezor` Hardware Wallet Module Static Methods', () => {
  afterEach(() => {
    EthereumTx.mockClear();
    EthereumTx.mockRestore();
  });
  describe('`signTransaction()` static method', () => {
    test('Uses the correct trezor service payload type', async () => {
      const { type, requiredFirmware } = PAYLOAD_SIGNTX;
      await signTransaction(mockedTransactionObject);
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
      await signTransaction(mockedTransactionObject);
      /*
       * Calls the validation helper with the correct values
       */
      expect(transactionObjectValidator).toHaveBeenCalled();
      expect(transactionObjectValidator).toHaveBeenCalledWith(
        mockedTransactionObject,
      );
    });
    test('Normalizes the transaction input values', async () => {
      await signTransaction(mockedTransactionObject);
      /*
       * The derivation path is already normalized, so don't do it again
       */
      expect(derivationPathNormalizer).not.toHaveBeenCalled();
      /*
       * Normalizes gas price and gas limit
       */
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalled();
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(gasPrice);
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(gasLimit);
      /*
       * Normalizes the nonce
       */
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalled();
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(nonce);
      /*
       * Normalizes the destination address
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledWith(to, false);
      /*
       * Normalizes the transaction value
       */
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalled();
      expect(multipleOfTwoHexValueNormalizer).toHaveBeenCalledWith(value);
      /*
       * Normalizes the transaction input data
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(inputData, false);
    });
    test('Converts R,S,V ECDSA into a hex signature', async () => {
      const rComponent = 'mocked-r-signature-component';
      const sComponent = 'mocked-s-signature-component';
      const recoveryParam = 'mocked-recovery param';
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a different response
       */
      payloadListener.mockImplementation(() => ({
        r: rComponent,
        s: sComponent,
        v: recoveryParam,
      }));
      await signTransaction(mockedTransactionObject);
      expect(EthereumTx).toHaveBeenCalled();
      expect(EthereumTx).toHaveBeenCalledWith({
        r: rComponent,
        s: sComponent,
        v: recoveryParam,
      });
    });
    test('Catches is something goes wrong along the way', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error from one of the method
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error('Oh no!')),
      );
      expect(signTransaction(mockedTransactionObject)).rejects.toThrow();
    });
    test('Log a warning if the user Cancels signing it', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a cancel response.
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error(STD_ERRORS.CANCEL_TX_SIGN)),
      );
      await signTransaction(mockedTransactionObject);
      expect(EthereumTx).not.toHaveBeenCalled();
      /*
       * User cancelled, so we don't throw
       */
      expect(utils.warning).toHaveBeenCalled();
    });
  });
});
