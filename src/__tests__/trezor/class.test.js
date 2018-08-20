import TrezorWalletClass from '../../trezor/class';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../trezor/staticMethods';

import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../../core/types';

jest.dontMock('../../trezor/class');

jest.mock('../../trezor/staticMethods');
jest.mock('../../core/validators');
jest.mock('../../core/normalizers');

/*
 * Common values
 */
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const addressCount = 10;
const mockedProvider = { chainId: 4 };
const mockedInstanceArgument = {
  publicKey: rootPublicKey,
  chainCode: rootChainCode,
  rootDerivationPath,
  addressCount,
  provider: mockedProvider,
};

describe('Trezor` Hardware Wallet Module', () => {
  describe('`TrezorWallet` class', () => {
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
        const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
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
      "Calls the `signTransaction()` static method passes a new chain Id",
      async () => {
        const trezorWallet = new TrezorWalletClass(mockedInstanceArgument);
        const mockedChainId = 56762;
        /*
        * Overrides the chainId form the provider
        */
        await trezorWallet.sign({ chainId: mockedChainId });
        expect(signTransaction).toHaveBeenCalledWith(expect.objectContaining({
          chainId: mockedChainId,
        }));
      },
    );
    test(
      "Calls the `signTransaction()` static method using the fallback chain Id",
      async () => {
        const trezorWallet = new TrezorWalletClass({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount,
        });
        /*
         * Does not have a chain id from the provider, and we don't pass on in
         * falls back to the default one
         */
        await trezorWallet.sign();
        expect(signTransaction).toHaveBeenCalledWith(expect.objectContaining({
          chainId: 1,
        }));
      },
    );
    test(
      "Calls the `signMessage()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
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
    test(
      "Calls the `verifyMessage()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
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
