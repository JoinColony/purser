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
      const addressGeneratedFromPublicKey = 'mocked-hex-address';
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
      const addressGeneratedFromPublicKey = 'mocked-hex-address';
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
