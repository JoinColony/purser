import { userInputValidator } from '../../core/helpers';
import TrezorWalletClass from '../../trezor/class';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../trezor/staticMethods';

import { REQUIRED_PROPS } from '../../core/defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../../core/types';

jest.dontMock('../../trezor/class');

jest.mock('../../trezor/staticMethods');
jest.mock('../../core/validators');
jest.mock('../../core/normalizers');
jest.mock('../../core/helpers');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const mockedChainId = 'mocked-chain-id';
const addressCount = 10;
const mockedMessage = 'mocked-message';
const mockedInstanceArgument = {
  publicKey: rootPublicKey,
  chainCode: rootChainCode,
  rootDerivationPath,
  addressCount,
};
const mockedTransactionObject = {
  to: 'mocked-address',
  nonce: 'mocked-nonce',
  value: 'mocked-transaction-value',
};
const mockedMessageObject = {
  message: mockedMessage,
};

describe('Trezor` Hardware Wallet Module', () => {
  describe('`TrezorWallet` class', () => {
    afterEach(() => {
      signTransaction.mockClear();
      signMessage.mockClear();
      verifyMessage.mockClear();
      userInputValidator.mockClear();
    });
    test('Creates a new wallet instance', () => {
      const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
      expect(trezorWallet).toBeInstanceOf(TrezorWalletClass);
    });
    test('The Wallet Objet has the correct types props', () => {
      const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
      /*
       * We already check for the others in the generic class tests, we just need to
       * ensure that the correct type and subtype are set.
       */
      expect(trezorWallet).toHaveProperty('type', TYPE_HARDWARE);
      expect(trezorWallet).toHaveProperty('subtype', SUBTYPE_TREZOR);
    });
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      "Calls the `signTransaction()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass({
          ...mockedInstanceArgument,
          chainId: mockedChainId,
        });
        const defaultDerivationPath = await trezorWallet.derivationPath;
        /*
         * Should have the `sign()` internal method set on the instance
         */
        expect(trezorWallet).toHaveProperty('sign');
        await trezorWallet.sign();
        /*
         * `sign()` internal method, which is mapped to the
         * static `signTransaction()` method
         */
        expect(signTransaction).toHaveBeenCalled();
        expect(signTransaction).toHaveBeenCalledWith({
          chainId: mockedChainId,
          derivationPath: defaultDerivationPath,
        });
      },
    );
    test('Validate `sign` method user input', async () => {
      const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
      await trezorWallet.sign(mockedTransactionObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedTransactionObject,
        requiredAll: REQUIRED_PROPS.SIGN_TRANSACTION,
      });
    });
    test(
      "Calls the `signMessage()` static method from the instance's methods",
      async () => {
        const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
        const defaultDerivationPath = await trezorWallet.derivationPath;
        /*
         * Should have the `signMessage()` internal method set on the instance
         */
        expect(trezorWallet).toHaveProperty('signMessage');
        await trezorWallet.signMessage();
        /*
         * `signMessage()` internal method, which is mapped to the
         * static `signMessage()` method
         */
        expect(signMessage).toHaveBeenCalled();
        expect(signMessage).toHaveBeenCalledWith({
          derivationPath: defaultDerivationPath,
        });
      },
    );
    test('Validate `signMessage` method user input', async () => {
      const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
      await trezorWallet.signMessage(mockedMessageObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedMessageObject,
        requiredAll: REQUIRED_PROPS.SIGN_MESSAGE,
      });
    });
    test(
      "Calls the `verifyMessage()` static method from the instance's methods",
      async () => {
        const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
        /*
         * Should have the `verifyMessage()` internal method set on the instance
         */
        expect(trezorWallet).toHaveProperty('verifyMessage');
        await trezorWallet.verifyMessage();
        /*
         * `signMessage()` internal method, which is mapped to the
         * static `signMessage()` method
         */
        expect(verifyMessage).toHaveBeenCalled();
        expect(verifyMessage).toHaveBeenCalledWith({
          address: trezorWallet.address,
        });
      },
    );
    /* eslint-enable prettier/prettier */
  });
});
