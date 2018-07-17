import HDKey from 'hdkey';
import { SigningKey } from 'ethers/wallet';

import TrezorWalletClass from '../../trezor/class';
import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from '../../trezor/validators';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../trezor/normalizers';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../trezor/staticMethods';

import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../../walletTypes';

jest.dontMock('../../trezor/class');

jest.mock('hdkey');
jest.mock('ethers/wallet');
jest.mock('../../trezor/validators');
jest.mock('../../trezor/normalizers');
jest.mock('../../trezor/staticMethods');

/*
 * Common values
 */
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const addressCount = 10;
const addressCountSingle = 1;
const mockedProvider = { chainId: 4 };

describe('Trezor` Hardware Wallet Module', () => {
  afterEach(() => {
    addressNormalizer.mockClear();
    addressNormalizer.mockRestore();
    hexSequenceNormalizer.mockClear();
    hexSequenceNormalizer.mockRestore();
  });
  describe('`TrezorWallet` class', () => {
    test('Creates a new wallet instance', () => {
      const trezorWallet = new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      );
      expect(trezorWallet).toBeInstanceOf(TrezorWalletClass);
    });
    test('Derives the address derivation path from the root path', () => {
      /* eslint-disable-next-line no-new */
      new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      );
      expect(HDKey).toHaveBeenCalled();
    });
    test('Generates the address(es) from the public key(s)', () => {
      /* eslint-disable-next-line no-new */
      new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      );
      expect(SigningKey.publicKeyToAddress).toHaveBeenCalled();
    });
    test('The Wallet Objet has the required (correct) props', () => {
      const trezorWallet = new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      );
      /*
       * Address
       */
      expect(trezorWallet).toHaveProperty('address');
      /*
       * Public Key
       */
      expect(trezorWallet).toHaveProperty('publicKey');
      /*
       * Derivation Path
       */
      expect(trezorWallet).toHaveProperty('derivationPath');
      /*
       * Wallet type
       */
      expect(trezorWallet).toHaveProperty('type', TYPE_HARDWARE);
      expect(trezorWallet).toHaveProperty('subtype', SUBTYPE_TREZOR);
    });
    test('Validates values used to instantiate', async () => {
      const addressGeneratedFromPublicKey = 'mocked-hex-address';
      /* eslint-disable-next-line no-new */
      new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCountSingle,
        mockedProvider,
      );
      /*
       * Validates the address count
       */
      expect(safeIntegerValidator).toHaveBeenCalled();
      expect(safeIntegerValidator).toHaveBeenCalledWith(addressCountSingle);
      /*
       * Validates the public key and chain code
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(rootPublicKey);
      expect(hexSequenceValidator).toHaveBeenCalledWith(rootChainCode);
      /*
       * Validates the hex address that was generated from the public key
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(
        /*
         * 0, since it's the first address, this comes from the mocked HDKey method.
         * But truth be told, this test is kind of useless...
         */
        `${addressGeneratedFromPublicKey}-0`,
      );
    });
    test('Normalizes values used to instantiate', async () => {
      /* eslint-disable-next-line no-new */
      new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      );
      /*
       * Normalizes all addresses that are derived from the public keys
       */
      expect(addressNormalizer).toHaveBeenCalled();
      expect(addressNormalizer).toHaveBeenCalledTimes(addressCount);
      /*
       * Normalizes all publicKey that are derived from the root one
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledTimes(addressCount);
    });
    test('Changes the default address', async () => {
      const addressGeneratedFromPublicKey = 'mocked-hex-address';
      /* eslint-disable-next-line no-new */
      const trezorWallet = new TrezorWalletClass(
        rootPublicKey,
        rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      );
      /*
       *  Should have the `setDefaultAddress` internal method set on the instance
       */
      expect(trezorWallet).toHaveProperty('setDefaultAddress');
      /*
       * By default the first (index 0) address and public key
       * are selected as defaults
       */
      expect(trezorWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-0`,
      );
      /*
       * Private key is a `hex` string
       */
      const intialPublicKey = await trezorWallet.publicKey;
      expect(Buffer.from(intialPublicKey, 'hex').toString()).toEqual(
        `${addressGeneratedFromPublicKey}-0`,
      );
      /*
       * Change the default account
       */
      const newAddressIndex = 2;
      expect(
        trezorWallet.setDefaultAddress(newAddressIndex),
      ).resolves.toBeTruthy();
      /*
       * Now the address should reflec the new index
       */
      expect(trezorWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-${newAddressIndex}`,
      );
      /*
       * As well as as the private key
       */
      const newPublicKey = await trezorWallet.publicKey;
      expect(Buffer.from(newPublicKey, 'hex').toString()).toEqual(
        `${addressGeneratedFromPublicKey}-${newAddressIndex}`,
      );
    });
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      'Cannot change the default address (single address opened)',
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass(
          rootPublicKey,
          rootChainCode,
          rootDerivationPath,
          addressCountSingle,
          mockedProvider,
        );
        expect(trezorWallet.setDefaultAddress(2)).rejects.toThrow();
      },
    );
    test(
      "Calls the `signTransaction()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass(
          rootPublicKey,
          rootChainCode,
          rootDerivationPath,
          addressCount,
          mockedProvider,
        );
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
          path: defaultDerivationPath,
        });
      },
    );
    test(
      "Calls the `signMessage()` static method from the instance's methods",
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass(
          rootPublicKey,
          rootChainCode,
          rootDerivationPath,
          addressCount,
          mockedProvider,
        );
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
        const trezorWallet = new TrezorWalletClass(
          rootPublicKey,
          rootChainCode,
          rootDerivationPath,
          addressCount,
          mockedProvider,
        );
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
    test(
      'Has the `otherAddresses` prop if multiple were instantiated',
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass(
          rootPublicKey,
          rootChainCode,
          rootDerivationPath,
          addressCount,
          mockedProvider,
        );
        expect(trezorWallet).toHaveProperty('otherAddresses');
        expect(trezorWallet.otherAddresses.length).toEqual(addressCount);
      },
    );
    test(
      'Does not have the `otherAddresses` prop if only one was instantiated',
      async () => {
        /* eslint-disable-next-line no-new */
        const trezorWallet = new TrezorWalletClass(
          rootPublicKey,
          rootChainCode,
          rootDerivationPath,
          addressCountSingle,
          mockedProvider,
        );
        expect(trezorWallet).not.toHaveProperty('otherAddresses');
      }
    );
    /* eslint-enable prettier/prettier */
  });
});
