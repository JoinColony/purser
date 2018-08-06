import HDKey from 'hdkey';
import { SigningKey } from 'ethers/wallet';

import GenericWallet from '../../core/genericWallet';
import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from '../../core/validators';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '../../core/normalizers';

jest.dontMock('../../core/genericWallet');

jest.mock('hdkey');
jest.mock('ethers/wallet');
jest.mock('../../core/validators');
jest.mock('../../core/normalizers');

/*
 * Common values
 */
const addressGeneratedFromPublicKey = 'mocked-hex-address';
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const addressCount = 10;
const addressCountSingle = 1;
const mockedProvider = { chainId: 4 };

describe('`Core` Module', () => {
  afterEach(() => {
    addressNormalizer.mockClear();
    addressNormalizer.mockRestore();
    hexSequenceNormalizer.mockClear();
    hexSequenceNormalizer.mockRestore();
  });
  describe('`GenericWallet` class', () => {
    test('Creates a new wallet instance', () => {
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      expect(genericWallet).toBeInstanceOf(GenericWallet);
    });
    test('Derives the address derivation path from the root path', () => {
      /* eslint-disable-next-line no-new */
      new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        mockedProvider,
      });
      expect(HDKey).toHaveBeenCalled();
    });
    test('Adapts to differnt versions of the derivation path', async () => {
      const firstDerivationPathIndex = `${rootDerivationPath}/0`;
      /*
       * A "trezor"-default derivation path, that ends with a digit.
       * Eg: m/44'/60'/0'/0
       */
      const derivationPathWithDigitWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      /* eslint-disable-next-line prettier/prettier */
      const derivationPathWithDigit =
        await derivationPathWithDigitWallet.derivationPath;
      expect(derivationPathWithDigit).toEqual(firstDerivationPathIndex);
      /*
       * A "ledger"-default derivation path, that ends with a slash.
       * Eg: m/44'/60'/0'/
       */
      const derivationPathWithSpliterWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath: `${rootDerivationPath}/`,
        addressCount,
        provider: mockedProvider,
      });
      /* eslint-disable-next-line prettier/prettier */
      const derivationPathWithSplitter =
        await derivationPathWithSpliterWallet.derivationPath;
      expect(derivationPathWithSplitter).toEqual(firstDerivationPathIndex);
    });
    test('Generates the address(es) from the public key(s)', () => {
      /* eslint-disable-next-line no-new */
      new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      expect(SigningKey.publicKeyToAddress).toHaveBeenCalled();
    });
    test('The Wallet Objet has the required (correct) props', () => {
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      /*
       * Address
       */
      expect(genericWallet).toHaveProperty('address');
      /*
       * Public Key
       */
      expect(genericWallet).toHaveProperty('publicKey');
      /*
       * Derivation Path
       */
      expect(genericWallet).toHaveProperty('derivationPath');
      /*
       * `sign()` method (but it's empty -- you're supposed to overwrite it)
       */
      expect(genericWallet).toHaveProperty('sign');
      /*
       * `signMessage()` method (but it's empty -- you're supposed to overwrite it)
       */
      expect(genericWallet).toHaveProperty('signMessage');
      /*
       * `verifyMessage()` method (but it's empty -- you're supposed to overwrite it)
       */
      expect(genericWallet).toHaveProperty('verifyMessage');
    });
    test('Validates values used to instantiate', async () => {
      /* eslint-disable-next-line no-new */
      new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount: addressCountSingle,
        provider: mockedProvider,
      });
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
      new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
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
      /* eslint-disable-next-line no-new */
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      /*
       *  Should have the `setDefaultAddress` internal method set on the instance
       */
      expect(genericWallet).toHaveProperty('setDefaultAddress');
      /*
       * By default the first (index 0) address and public key
       * are selected as defaults
       */
      expect(genericWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-0`,
      );
      /*
       * Private key is a `hex` string
       */
      const intialPublicKey = await genericWallet.publicKey;
      expect(Buffer.from(intialPublicKey, 'hex').toString()).toEqual(
        `${addressGeneratedFromPublicKey}-0`,
      );
      /*
       * Change the default account
       */
      const newAddressIndex = 2;
      expect(
        genericWallet.setDefaultAddress(newAddressIndex),
      ).resolves.toBeTruthy();
      /*
       * Now the address should reflec the new index
       */
      expect(genericWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-${newAddressIndex}`,
      );
      /*
       * As well as as the private key
       */
      const newPublicKey = await genericWallet.publicKey;
      expect(Buffer.from(newPublicKey, 'hex').toString()).toEqual(
        `${addressGeneratedFromPublicKey}-${newAddressIndex}`,
      );
    });
    test('Changes the default address with no arguments provided', async () => {
      /* eslint-disable-next-line no-new */
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
        provider: mockedProvider,
      });
      /*
       * Set the initial default account to something later down the array index
       */
      const initialAddressIndex = 4;
      expect(
        genericWallet.setDefaultAddress(initialAddressIndex),
      ).resolves.toBeTruthy();
      expect(genericWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-${initialAddressIndex}`,
      );
      /*
       * Change the default account with no arguments provided, so it defaults
       * To the the initial values
       */
      const defaultAddressIndex = 0;
      expect(genericWallet.setDefaultAddress()).resolves.toBeTruthy();
      /*
       * Now the address should reflec the new index
       */
      expect(genericWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-${defaultAddressIndex}`,
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
        const genericWallet = new GenericWallet({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount: addressCountSingle,
          provider: mockedProvider,
        });
        expect(genericWallet.setDefaultAddress(2)).rejects.toThrow();
      },
    );
    test(
      'Has the `otherAddresses` prop if multiple were instantiated',
      async () => {
        /* eslint-disable-next-line no-new */
        const genericWallet = new GenericWallet({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount,
          provider: mockedProvider,
        });
        expect(genericWallet).toHaveProperty('otherAddresses');
        expect(genericWallet.otherAddresses.length).toEqual(addressCount);
      },
    );
    test('Opens the first 10 wallet addresses by default', () => {
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        provider: mockedProvider,
      });
      /*
       * If no value was passed to the addressCount, it defaults to 10
       *
       * This means the otherAddreses prop is available and contains the first
       * 10 derived addresses
       */
      expect(genericWallet).toHaveProperty('otherAddresses');
      expect(genericWallet.otherAddresses.length).toEqual(addressCount);
    });
    test('Falls back to 1 if address count was set to falsy value', () => {
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount: false,
        provider: mockedProvider,
      });
      /*
       * If a falsy value was passed to the addressCount, it bypasses the default,
       * but it should be caught by the fallback inside the array map (and falls
       * back to 1)
       *
       * This means the otherAddreses prop will not be available, but we still have
       * one (the first) addres opened.
       */
      expect(genericWallet).not.toHaveProperty('otherAddresses');
      expect(genericWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-0`,
      );
    });
    test(
      'Does not have the `otherAddresses` prop if only one was instantiated',
      async () => {
        /* eslint-disable-next-line no-new */
        const genericWallet = new GenericWallet({
          publicKey: rootPublicKey,
          chainCode: rootChainCode,
          rootDerivationPath,
          addressCount: addressCountSingle,
          provider: mockedProvider,
        });
        expect(genericWallet).not.toHaveProperty('otherAddresses');
      }
    );
    /* eslint-enable prettier/prettier */
  });
});
