import EthereumTx from 'ethereumjs-tx';

import {
  derivationPathValidator,
  bigNumberValidator,
  safeIntegerValidator,
  addressValidator,
  hexSequenceValidator,
} from '../../../core/validators';

import * as utils from '../../../utils';

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
jest.mock('../../../utils');
jest.mock('../../../trezor/helpers');
jest.mock('../../../core/validators');
/*
 * Manual mocking a manual mock. Yay for Jest being build by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../core/normalizers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../core/__mocks-required__/normalizers'),
);

const path = 'mocked-derivation-path';
const chainId = 'mocked-chain-id';
const inputData = 'mocked-data';
const gasLimit = 'mocked-gas-limit';
const gasPrice = 'mocked-gas-price';
const nonce = 'mocked-nonce';
const to = 'mocked-destination-address';
const value = 'mocked-transaction-value';

describe('`Trezor` Hardware Wallet Module', () => {
  afterEach(() => {
    EthereumTx.mockClear();
    EthereumTx.mockRestore();
  });
  describe('`signTransacion()` static method Static Methods', () => {
    test('Uses the correct trezor service payload type', async () => {
      const { type, requiredFirmware } = PAYLOAD_SIGNTX;
      await signTransaction({
        /*
         * These values are not correct. Do not use the as reference.
         * If the validators wouldn't be mocked, they wouldn't pass.
         */
        path,
        chainId,
        inputData,
        gasLimit,
        gasPrice,
        nonce,
        to,
        value,
      });
      expect(payloadListener).toHaveBeenCalled();
      expect(payloadListener).toHaveBeenCalledWith({
        payload: {
          /*
           * We only care about what payload type this method sends
           */
          address_n: expect.anything(),
          chain_id: expect.anything(),
          data: expect.anything(),
          gas_limit: expect.anything(),
          gas_price: expect.anything(),
          nonce: expect.anything(),
          to: expect.anything(),
          value: expect.anything(),
          /*
           * These two values should be correct
           */
          type,
          requiredFirmware,
        },
      });
    });
    test('Validates transaction input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await signTransaction({
        path,
        chainId,
        inputData,
        gasLimit,
        gasPrice,
        nonce,
        to,
        value,
      });
      /*
       * Validates the derivation path
       */
      expect(derivationPathValidator).toHaveBeenCalled();
      expect(derivationPathValidator).toHaveBeenCalledWith(path);
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
    test('Normalizes transaction input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await signTransaction({
        path,
        inputData,
        gasLimit,
        gasPrice,
        nonce,
        to,
        value,
      });
      /*
       * Normalizes the derivation path
       */
      expect(derivationPathNormalizer).toHaveBeenCalled();
      expect(derivationPathNormalizer).toHaveBeenCalledWith(path);
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
      await signTransaction();
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
      expect(signTransaction()).rejects.toThrow();
    });
    test('Log a warning if the user Cancels signing it', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a cancel response.
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error(STD_ERRORS.CANCEL_TX_SIGN)),
      );
      await signTransaction();
      expect(EthereumTx).not.toHaveBeenCalled();
      /*
       * User cancelled, so we don't throw
       */
      expect(utils.warning).toHaveBeenCalled();
    });
  });
});
