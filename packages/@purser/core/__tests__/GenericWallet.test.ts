/* eslint-disable no-new */
import HDKey from 'hdkey';
import { pubToAddress } from 'ethereumjs-util';
import { mocked } from 'ts-jest/utils';

import { GenericWallet } from '../src';
import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from '../src/validators';
import { addressNormalizer, hexSequenceNormalizer } from '../src/normalizers';
import { CHAIN_IDS } from '../src/constants';

jest.mock('hdkey');
jest.mock('../src/validators');
jest.mock('../src/normalizers');

const mockedAddressNormalizer = mocked(addressNormalizer);
const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);
const mockedPubToAddress = mocked(pubToAddress);

/*
 * Common values
 */
const addressGeneratedFromPublicKey = 'mocked-hex-address';
const rootPublicKey = 'mocked-root-public-key';
const rootChainCode = 'mocked-root-chain-code';
const rootDerivationPath = 'mocked-root-derivation-path';
const mockedChainId = 123123;
const addressCount = 10;
const addressCountSingle = 1;
const mockedArguments = {
  publicKey: rootPublicKey,
  chainCode: rootChainCode,
  rootDerivationPath,
  addressCount,
  chainId: mockedChainId,
};

describe('`Core` Module', () => {
  afterEach(() => {
    mockedAddressNormalizer.mockClear();
    mockedHexSequenceNormalizer.mockClear();
    mockedPubToAddress.mockClear();
  });
  describe('`GenericWallet` class', () => {
    test('Creates a new wallet instance', () => {
      // @ts-ignore
      const genericWallet = new GenericWallet(mockedArguments);
      expect(genericWallet).toBeInstanceOf(GenericWallet);
    });
    test('Derives the address derivation path from the root path', () => {
      // @ts-ignore
      new GenericWallet(mockedArguments);
      expect(HDKey).toHaveBeenCalled();
    });
    test('Adapts to differnt versions of the derivation path', async () => {
      const firstDerivationPathIndex = `${rootDerivationPath}/0`;
      /*
       * A "trezor"-default derivation path, that ends with a digit.
       * Eg: m/44'/60'/0'/0
       */
      // @ts-ignore
      const derivationPathWithDigitWallet = new GenericWallet(mockedArguments);
      const derivationPathWithDigit = await derivationPathWithDigitWallet.getDerivationPath();
      expect(derivationPathWithDigit).toEqual(firstDerivationPathIndex);
      /*
       * A "ledger"-default derivation path, that ends with a slash.
       * Eg: m/44'/60'/0'/
       */
      // @ts-ignore
      const derivationPathWithSpliterWallet = new GenericWallet({
        ...mockedArguments,
        rootDerivationPath: `${rootDerivationPath}/`,
      });
      const derivationPathWithSplitter = await derivationPathWithSpliterWallet.getDerivationPath();
      expect(derivationPathWithSplitter).toEqual(firstDerivationPathIndex);
    });
    test('Generates the address(es) from the public key(s)', () => {
      // @ts-ignore
      new GenericWallet(mockedArguments);
      expect(pubToAddress).toHaveBeenCalled();
    });
    test('The Wallet Object has the required (correct) props', async () => {
      // @ts-ignore
      const genericWallet = new GenericWallet(mockedArguments);
      /*
       * Address
       */
      expect(genericWallet).toHaveProperty('address');
      /*
       * Public Key
       * We have to call it directly since Jest's `toHaveProperty` doesn't play well with getters
       */
      await expect(genericWallet.getPublicKey()).resolves.toEqual(
        expect.any(String),
      );
      /*
       * Derivation Path
       * We have to call it directly since Jest's `toHaveProperty` doesn't play well with getters
       */
      await expect(genericWallet.getDerivationPath()).resolves.toEqual(
        `${rootDerivationPath}/0`,
      );
      /*
       * Chain Id
       */
      expect(genericWallet).toHaveProperty('chainId');
    });
    test('The Wallet Object sets the chain Id correctly', () => {
      const locallyMockedChainId = 222;
      // @ts-ignore
      const genericWallet = new GenericWallet({
        ...mockedArguments,
        chainId: locallyMockedChainId,
      });
      /*
       * Address
       */
      expect(genericWallet).toHaveProperty('chainId', locallyMockedChainId);
    });
    test('The Wallet Object falls back to the default chainId', () => {
      // @ts-ignore
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        addressCount,
      });
      /*
       * Address
       */
      expect(genericWallet).toHaveProperty('chainId', CHAIN_IDS.HOMESTEAD);
    });
    test('Validates values used to instantiate', async () => {
      // @ts-ignore
      new GenericWallet({
        ...mockedArguments,
        addressCount: addressCountSingle,
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
      // @ts-ignore
      new GenericWallet(mockedArguments);
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
      // @ts-ignore
      const genericWallet = new GenericWallet(mockedArguments);
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
      const intialPublicKey = await genericWallet.getPublicKey();
      expect(Buffer.from(intialPublicKey, 'hex').toString()).toEqual(
        `${addressGeneratedFromPublicKey}-0`,
      );
      /*
       * Change the default account
       */
      const newAddressIndex = 2;
      await expect(
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
      const newPublicKey = await genericWallet.getPublicKey();
      expect(Buffer.from(newPublicKey, 'hex').toString()).toEqual(
        `${addressGeneratedFromPublicKey}-${newAddressIndex}`,
      );
    });
    test('Changes the default address with no arguments provided', async () => {
      // @ts-ignore
      const genericWallet = new GenericWallet(mockedArguments);
      /*
       * Set the initial default account to something later down the array index
       */
      const initialAddressIndex = 4;
      await expect(
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
      await expect(genericWallet.setDefaultAddress()).resolves.toBeTruthy();
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
    test('Cannot change the default address (single address opened)', async () => {
      // @ts-ignore
      const genericWallet = new GenericWallet({
        ...mockedArguments,
        addressCount: addressCountSingle,
      });
      await expect(genericWallet.setDefaultAddress(2)).rejects.toThrow();
    });
    test('Has the `otherAddresses` prop if multiple were instantiated', async () => {
      // @ts-ignore
      const genericWallet = new GenericWallet(mockedArguments);
      expect(genericWallet).toHaveProperty('otherAddresses');
      expect(genericWallet.otherAddresses).toHaveLength(addressCount);
    });
    test('Opens the first 10 wallet addresses by default', () => {
      // @ts-ignore
      const genericWallet = new GenericWallet({
        publicKey: rootPublicKey,
        chainCode: rootChainCode,
        rootDerivationPath,
        chainId: mockedChainId,
      });
      /*
       * If no value was passed to the addressCount, it defaults to 10
       *
       * This means the otherAddreses prop is available and contains the first
       * 10 derived addresses
       */
      expect(genericWallet).toHaveProperty('otherAddresses');
      expect(genericWallet.otherAddresses).toHaveLength(addressCount);
    });
    test('Falls back to 1 if address count was set to falsy value', () => {
      // @ts-ignore
      const genericWallet = new GenericWallet({
        ...mockedArguments,
        addressCount: NaN,
      });
      /*
       * If a falsy value was passed to the addressCount, it bypasses the default,
       * but it should be caught by the fallback inside the array map (and falls
       * back to 1)
       *
       * This means the otherAddreses prop will not be available, but we still have
       * one (the first) addres opened.
       */
      expect(genericWallet).toHaveProperty('otherAddresses', []);
      expect(genericWallet).toHaveProperty(
        'address',
        `${addressGeneratedFromPublicKey}-0`,
      );
    });
    test('`otherAddresses` prop is empty if only one was instantiated', async () => {
      // @ts-ignore
      const genericWallet = new GenericWallet({
        ...mockedArguments,
        addressCount: addressCountSingle,
      });
      expect(genericWallet).toHaveProperty('otherAddresses', []);
    });
  });
});
