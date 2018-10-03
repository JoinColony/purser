import { userInputValidator } from '@colony/purser-core/helpers';
import LedgerWalletClass from '@colony/purser-ledger/class';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '@colony/purser-ledger/staticMethods';

import { REQUIRED_PROPS } from '@colony/purser-core/defaults';
import { TYPE_HARDWARE, SUBTYPE_LEDGER } from '@colony/purser-core/types';

jest.dontMock('@colony/purser-ledger/class');

jest.mock('hdkey');
jest.mock('ethers/wallet');
jest.mock('@colony/purser-ledger/staticMethods');
jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);

/*
 * Common values
 */
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const mockedChainId = 'mocked-chain-id';
const addressCount = 10;
const mockedMessage = 'mocked-message';
const mockedSignature = 'mocked-signature';
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
const mockedSignatureObject = {
  message: mockedMessage,
  signature: mockedSignature,
};

describe('Ledger` Hardware Wallet Module', () => {
  describe('`LedgerWallet` class', () => {
    afterEach(() => {
      signTransaction.mockClear();
      signMessage.mockClear();
      verifyMessage.mockClear();
      userInputValidator.mockClear();
    });
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
        const ledgerWallet = new LedgerWalletClass({
          ...mockedInstanceArgument,
          chainId: mockedChainId,
        });
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
          chainId: mockedChainId,
          derivationPath: defaultDerivationPath,
        });
      },
    );
    test(
      "Calls the `signTransaction()` static method passes a new chain Id",
      async () => {
        const ledgerWallet = new LedgerWalletClass(mockedInstanceArgument);
        const locallyMockedChainId = 26765;
        /*
        * Overrides the chainId form the provider
        */
        await ledgerWallet.sign({ chainId: locallyMockedChainId });
        expect(signTransaction).toHaveBeenCalledWith(expect.objectContaining({
          chainId: locallyMockedChainId,
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
    test('Validates `sign` method user input', async () => {
      const trezorWallet = new LedgerWalletClass(mockedInstanceArgument);
      await trezorWallet.sign(mockedTransactionObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedTransactionObject,
      });
    });
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
    test('Validate `signMessage` method user input', async () => {
      const trezorWallet = new LedgerWalletClass(mockedInstanceArgument);
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
    test('Validate `verifyMessage` method user input', async () => {
      const trezorWallet = new LedgerWalletClass(mockedInstanceArgument);
      await trezorWallet.verifyMessage(mockedSignatureObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedSignatureObject,
        requiredAll: REQUIRED_PROPS.VERIFY_MESSAGE,
      });
    });
  });
});
