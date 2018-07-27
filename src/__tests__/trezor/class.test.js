import TrezorWalletClass from '../../trezor/class';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../trezor/staticMethods';

import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../../core/types';

jest.dontMock('../../trezor/class');
jest.mock('hdkey');
jest.mock('ethers/wallet');
jest.mock('../../trezor/staticMethods');
jest.mock('../../core/validators');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../core/normalizers', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__remocks__/normalizers'),
);

/*
 * Common values
 */
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const addressCount = 10;
const mockedProvider = { chainId: 4 };

describe('Trezor` Hardware Wallet Module', () => {
  describe('`TrezorWallet` class', () => {
    test('Creates a new wallet instance', () => {
      const trezorWallet = new TrezorWalletClass({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      expect(trezorWallet).toBeInstanceOf(TrezorWalletClass);
    });
    test('The Wallet Objet has the correct types props', () => {
      const trezorWallet = new TrezorWalletClass({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
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
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount,
          provider: mockedProvider,
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
          chainId: mockedProvider.chainId,
          derivationPath: defaultDerivationPath,
        });
      },
    );
    test(
      "Calls the `signMessage()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount,
          provider: mockedProvider,
        });
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
          path: defaultDerivationPath,
        });
      },
    );
    test(
      "Calls the `verifyMessage()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount,
          provider: mockedProvider,
        });
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
