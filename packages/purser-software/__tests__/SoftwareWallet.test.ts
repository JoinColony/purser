import { privateToPublic } from 'ethereumjs-util';
import { encrypt } from 'ethers/utils/secret-storage';

import { jestMocked } from '../../testutils';

import { userInputValidator } from '../../purser-core/src/helpers';
import { warning } from '../../purser-core/src/utils';
import {
  addressValidator,
  hexSequenceValidator,
} from '../../purser-core/src/validators';
import { hexSequenceNormalizer } from '../../purser-core/src/normalizers';

import SoftwareWallet from '../../purser-software/src/SoftwareWallet';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../purser-software/src/staticMethods';

import { REQUIRED_PROPS } from '../../purser-core/src/constants';
import { WalletType, WalletSubType } from '../../purser-core/src/types';

jest.mock('ethereumjs-util');
jest.mock('ethers/utils');
jest.mock('../../purser-core/src/validators');
jest.mock('../../purser-software/src/staticMethods');
jest.mock('../../purser-core/src/helpers');
jest.mock('../../purser-core/src/normalizers');
jest.mock('../../purser-core/src/utils');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const address = 'mocked-address';
const privateKey = '12345678';
const mnemonic = 'mocked-mnemonic';
const password = 'mocked-encryption-password';
const keystore = 'mocked-keystore';
const derivationPath = 'mocked-derivation-path';
const mockedMessage = 'mocked-message';
const mockedMessageData = 'mocked-message-data';
const mockedSignature = 'mocked-signature';
const mockedEthersSign = {
  bind: jest.fn(),
};
const mockedEthersSignMessage = {
  bind: jest.fn(),
};
const mockedArgumentsObject = {
  address,
  privateKey,
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

const mockedAddressValidator = jestMocked(addressValidator);
const mockedHexSequenceValidator = jestMocked(hexSequenceValidator);
const mockedPrivateToPublic = jestMocked(privateToPublic);
const mockedHexSequenceNormalizer = jestMocked(hexSequenceNormalizer);
const mockedWarning = jestMocked(warning);
const mockedEncrypt = jestMocked(encrypt);
const mockedSignTransaction = jestMocked(signTransaction);
const mockedUserInputValidator = jestMocked(userInputValidator);
const mockedSignMessage = jestMocked(signMessage);
const mockedVerifyMessage = jestMocked(verifyMessage);

describe('`Software` Wallet Module', () => {
  afterEach(() => {
    mockedAddressValidator.mockClear();
    mockedHexSequenceValidator.mockClear();
    mockedPrivateToPublic.mockClear();
    mockedHexSequenceNormalizer.mockClear();
    mockedWarning.mockClear();
    mockedEncrypt.mockClear();
    mockedSignTransaction.mockClear();
    mockedUserInputValidator.mockClear();
    mockedSignMessage.mockClear();
    mockedEthersSignMessage.bind.mockClear();
    mockedEthersSign.bind.mockClear();
    mockedVerifyMessage.mockClear();
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
      mockedAddressValidator.mockImplementation((value) => {
        if (!value) {
          throw new Error();
        }
        return true;
      });
      // @ts-ignore
      expect(() => new SoftwareWallet()).toThrow();
    });
    test('The instance object has the required (correct) props', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        originalMnemonic: mnemonic,
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
      expect(testWallet).toHaveProperty('type', WalletType.Software);
      expect(testWallet).toHaveProperty('subtype', WalletSubType.Ethers);
      /*
       * Sign transaction method
       */
      expect(testWallet).toHaveProperty('sign');
      /*
       * Sign message method
       */
      expect(testWallet).toHaveProperty('signMessage');
      /*
       * Verify message method
       */
      expect(testWallet).toHaveProperty('verifyMessage');
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
      await expect(testWallet.privateKey).resolves.toEqual(privateKey);
    });
    test('Gets the derivation path using the getter', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await expect(testWallet.derivationPath).resolves.toEqual(derivationPath);
    });
    test('Gets the mnemonic using the getter', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        originalMnemonic: mnemonic,
      });
      // FIXME
      // @ts-ignore
      await expect(testWallet.mnemonic).resolves.toEqual(mnemonic);
    });
    test('Gets the public key using the getter', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      /*
       * The mocked function returns the value it's passed, in this case the private
       * key, so we can use that to test.
       */
      await expect(testWallet.publicKey).resolves.toEqual(privateKey);
    });
    test('Reverts the public key from the private key', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.publicKey;
      expect(privateToPublic).toHaveBeenCalled();
      // This testcase has been removed - see https://github.com/SurfingNerd/purser/issues/1
      // expect(privateToPublic).toHaveBeenCalledWith(privateKey);
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
      await expect(testWallet.keystore).resolves.toEqual(keystore);
    });
    test("Can't get the keystore if no password was set", async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      /*
       * The promise rejects
       */
      await expect(testWallet.keystore).rejects.toBeUndefined();
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
      expect(encrypt).toHaveBeenCalled();
      expect(encrypt).toHaveBeenCalledWith(privateKey, password);
    });
    // FIXME
    // test('Sets the encryption password after instantiation', async () => {
    //   const testWallet = new SoftwareWallet(mockedArgumentsObject);
    //   // @ts-ignore
    //   testWallet.keystore = password;
    //   await expect(testWallet.keystore).resolves.toEqual(keystore);
    // });
    test('`sign()` calls the correct static method', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        // FIXME
        // @ts-ignore
        sign: mockedEthersSign,
      });
      await testWallet.sign();
      expect(signTransaction).toHaveBeenCalled();
    });
    test('Validates `sign` method user input', async () => {
      const trezorWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        // FIXME
        // @ts-ignore
        sign: mockedEthersSign,
      });
      await trezorWallet.sign(mockedTransactionObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedTransactionObject,
      });
    });
    test('`sign()` binds the ethers instance', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        // FIXME
        // @ts-ignore
        sign: mockedEthersSign,
      });
      await testWallet.sign();
      expect(mockedEthersSign.bind).toHaveBeenCalled();
    });
    test('`signMessages()` calls the correct static method', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        // FIXME
        // @ts-ignore
        signMessage: mockedEthersSignMessage,
      });
      await testWallet.signMessage({
        message: mockedMessage,
        messageData: mockedMessageData,
        callback: jest.fn(),
      });
      expect(signMessage).toHaveBeenCalled();
    });
    test('`signMessages()` binds the ethers instance', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        // FIXME
        // @ts-ignore
        signMessage: mockedEthersSignMessage,
      });
      await testWallet.signMessage({
        message: mockedMessage,
        messageData: mockedMessageData,
        callback: jest.fn(),
      });
      expect(mockedEthersSignMessage.bind).toHaveBeenCalled();
    });
    test('Validate `signMessage` method user input', async () => {
      const testWallet = new SoftwareWallet({
        ...mockedArgumentsObject,
        // FIXME
        // @ts-ignore
        signMessage: mockedEthersSignMessage,
      });
      await testWallet.signMessage(mockedMessageObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedMessageObject,
        requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
      });
    });
    test('`verifyMessages()` calls the correct static method', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.verifyMessage(mockedSignatureObject);
      expect(verifyMessage).toHaveBeenCalled();
    });
    test('Validate `verifyMessage` method user input', async () => {
      const testWallet = new SoftwareWallet(mockedArgumentsObject);
      await testWallet.verifyMessage(mockedSignatureObject);
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
