import LedgerWalletClass from '../../ledger/class';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../ledger/staticMethods';

import { TYPE_HARDWARE, SUBTYPE_LEDGER } from '../../core/types';

jest.dontMock('../../ledger/class');

jest.mock('../../ledger/staticMethods');
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

describe('Ledger` Hardware Wallet Module', () => {
  describe('`LedgerWallet` class', () => {
    test('Creates a new wallet instance', () => {
      const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
      expect(ledgerWallet).toBeInstanceOf(LedgerWalletClass);
    });
    test('The Wallet Objet has the correct types props', () => {
      const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
      /*
       * We already check for the others in the generic class tests, we just need to
       * ensure that the correct type and subtype are set.
       */
      expect(ledgerWallet).toHaveProperty('type', TYPE_HARDWARE);
      expect(ledgerWallet).toHaveProperty('subtype', SUBTYPE_LEDGER);
    });
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      "Calls the `signTransaction()` static method from the instance's methods",
      async () => {
        const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
        const defaultDerivationPath = await ledgerWallet.derivationPath;
        /*
         * Should have the `sign()` internal method set on the instance
         */
        expect(ledgerWallet).toHaveProperty('sign');
        await ledgerWallet.sign();
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
        const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
        const mockedChainId = 26765;
        /*
        * Overrides the chainId form the provider
        */
        await ledgerWallet.sign({ chainId: mockedChainId });
        expect(signTransaction).toHaveBeenCalledWith(expect.objectContaining({
          chainId: mockedChainId,
        }));
      },
    );
    test(
      "Calls the `signTransaction()` static method using the fallback chain Id",
      async () => {
        const ledgerWallet = new LedgerWalletClass({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount,
        });
        /*
         * Does not have a chain id from the provider, and we don't pass on in
         * falls back to the default one
         */
        await ledgerWallet.sign();
        expect(signTransaction).toHaveBeenCalledWith(expect.objectContaining({
          chainId: 1,
        }));
      },
    );
    test(
      "Calls the `signMessage()` static method from the instance's methods",
      async () => {
        const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
        const defaultDerivationPath = await ledgerWallet.derivationPath;
        /*
         * Should have the `signMessage()` internal method set on the instance
         */
        expect(ledgerWallet).toHaveProperty('signMessage');
        await ledgerWallet.signMessage();
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
        const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
        const defaultPublicKey = await ledgerWallet.publicKey;
        /*
         * Should have the `verifyMessage()` internal method set on the instance
         */
        expect(ledgerWallet).toHaveProperty('verifyMessage');
        await ledgerWallet.verifyMessage();
        /*
         * `signMessage()` internal method, which is mapped to the
         * static `signMessage()` method
         */
        expect(verifyMessage).toHaveBeenCalled();
        expect(verifyMessage).toHaveBeenCalledWith({
          publicKey: defaultPublicKey,
        });
      },
    );
    /* eslint-enable prettier/prettier */
  });
});
