import { privateToPublic } from 'ethereumjs-util';
import secretStorage from 'ethers/wallet/secret-storage';

import { warning } from '../../core/utils';
import { addressValidator, hexSequenceValidator } from '../../core/validators';
import { hexSequenceNormalizer } from '../../core/normalizers';

import SoftwareWallet from '../../software/class';
import { signTransaction } from '../../software/staticMethods';

import { TYPE_SOFTWARE, SUBTYPE_ETHERS } from '../../core/types';

jest.dontMock('../../software/class');

jest.mock('ethereumjs-util');
jest.mock('ethers/wallet/secret-storage');
jest.mock('../../core/utils');
jest.mock('../../core/helpers');
jest.mock('../../core/normalizers');
jest.mock('../../core/validators');
jest.mock('../../software/staticMethods');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const address = 'mocked-address';
const privateKey = 'mocked-private-key';
const mnemonic = 'mocked-mnemonic';
const password = 'mocked-encryption-password';
const keystore = 'mocked-keystore';
const derivationPath = 'mocked-derivation-path';
const mockedArgumentsObject = {
  address,
  privateKey,
};

describe('`Software` Wallet Module', () => {
  afterEach(() => {
    addressValidator.mockClear();
    hexSequenceValidator.mockClear();
    privateToPublic.mockClear();
    hexSequenceNormalizer.mockClear();
    warning.mockClear();
    secretStorage.encrypt.mockClear();
  });
  describe('`SoftwareWallet` Class', () => {
    test('Creates a new wallet', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      expect(testWallet).toBeInstanceOf(SoftwareWallet);
    });
    test('Throws if it cannot create it', async () => {
      /*
       * Because of the way we mocked it (and not just spyed of it), jest doesn't
       * allow us to automatically restore it using `mockRestore`, so we actually
       * have to re-write part of it's functionality.
       *
       * See:https://jestjs.io/docs/en/mock-function-api.html#mockfnmockrestore
       */
      addressValidator.mockImplementation(value => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      expect(() => new SoftwareWallet()).toThrow();
    });
    test('The instance object has the required (correct) props', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        mnemonic,
        password,
        keystore,
      });
      /*
       * Address
       */
      expect(testWallet).toHaveProperty('address');
      /*
       * Public Key Getter
       */
      expect(testWallet).toHaveProperty('publicKey');
      /*
       * Private Key Getter
       */
      expect(testWallet).toHaveProperty('privateKey');
      /*
       * Derivation Path Getter
       */
      expect(testWallet).toHaveProperty('derivationPath');
      /*
       * Mnemonic Getter
       */
      expect(testWallet).toHaveProperty('mnemonic');
      /*
       * Keystore Getter (and Setter)
       */
      expect(testWallet).toHaveProperty('keystore');
      /*
       * The correct identification type props
       */
      expect(testWallet).toHaveProperty('type', TYPE_SOFTWARE);
      expect(testWallet).toHaveProperty('subtype', SUBTYPE_ETHERS);
      /*
       * Sign transaction method
       */
      expect(testWallet).toHaveProperty('sign');
    });
    test('Only has the mnemonic prop if it was opened with it', () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      expect(testWallet).not.toHaveProperty('mnemonic');
    });
    test('Validates the address and private key', () => {
      /* eslint-disable-next-line no-new */
      new SoftwareWallet(mockedArgumentsObject);
      /*
       * Validates the address
       */
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(address);
      /*
       * Validates the private key
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(privateKey);
    });
    test('Gets the private key using the getter', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      expect(testWallet.privateKey).resolves.toEqual(privateKey);
    });
    test('Gets the derivation path using the getter', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      expect(testWallet.derivationPath).resolves.toEqual(derivationPath);
    });
    test('Gets the mnemonic using the getter', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        mnemonic,
      });
      expect(testWallet.mnemonic).resolves.toEqual(mnemonic);
    });
    test('Gets the public key using the getter', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      /*
       * The mocked function returns the value it's passed, in this case the private
       * key, so we can use that to test.
       */
      expect(testWallet.publicKey).resolves.toEqual(privateKey);
    });
    test('Reverts the public key from the private key', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.publicKey;
      expect(privateToPublic).toHaveBeenCalled();
      expect(privateToPublic).toHaveBeenCalledWith(privateKey);
    });
    test('Validates the newly reverted the public key', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.publicKey;
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(privateKey);
    });
    test('Normalizes the newly reverted the public key', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.publicKey;
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(privateKey);
    });
    test('Gets the keystore using the getter', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        password,
        keystore,
      });
      expect(testWallet.keystore).resolves.toEqual(keystore);
    });
    test("Can't get the keystore if no password was set", async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      /*
       * The promise rejects
       */
      expect(testWallet.keystore).rejects.toEqual(undefined);
      /*
       * And we warn the user about the missing password
       */
      expect(warning).toHaveBeenCalled();
    });
    test("Uses Ethers's `encrypt()` to generate the keystore", async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        password,
      });
      await testWallet.keystore;
      expect(secretStorage.encrypt).toHaveBeenCalled();
      expect(secretStorage.encrypt).toHaveBeenCalledWith(privateKey, password);
    });
    test('Sets the encryption password after instantiation', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      testWallet.keystore = password;
      expect(testWallet.keystore).resolves.toEqual(keystore);
    });
    test('`sign()` calls the correct static method', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.sign();
      expect(signTransaction).toHaveBeenCalled();
    });
  });
});
