import { privateToPublic } from 'ethereumjs-util';
import { encrypt } from 'ethers/utils/secret-storage';
import { mocked } from 'ts-jest/utils';
import type { MaybeMockedDeep } from 'ts-jest/dist/util/testing';
import { Wallet } from 'ethers/wallet';

import { userInputValidator } from '../../core/src/helpers';
import { bigNumber, warning } from '../../core/src/utils';
import {
  addressValidator,
  hexSequenceValidator,
} from '../../core/src/validators';
import { hexSequenceNormalizer } from '../../core/src/normalizers';

import SoftwareWallet from '../../software/src/SoftwareWallet';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../../software/src/staticMethods';

import {
  REQUIRED_PROPS,
  WalletType,
  WalletSubType,
} from '../../core/src/constants';
import { walletClass } from '../src/messages';

jest.mock('ethereumjs-util');
jest.mock('ethers/utils');
jest.mock('ethers/wallet');
jest.mock('../../core/src/validators');
jest.mock('../../software/src/staticMethods');
jest.mock('../../core/src/helpers');
jest.mock('../../core/src/normalizers');
jest.mock('../../core/src/utils');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const address = '0xacab';
const privateKey = '12345678';
const mnemonic = 'all cows are beautiful';
const password = 'mocked-encryption-password';
const keystore = 'mocked-keystore';
const derivationPath = 'mocked-derivation-path';
const chainId = 1337;
const mockedMessage = 'mocked-message';
const mockedMessageData = 'mocked-message-data';
const mockedSignature = 'mocked-signature';
const mockedTransactionObject = {
  to: 'mocked-address',
  nonce: 1,
  value: bigNumber(33),
  chainId,
  gasLimit: bigNumber(44),
  gasPrice: bigNumber(55),
  inputData: '1',
};
const mockedMessageObject = {
  message: mockedMessage,
  messageData: mockedMessageData,
};
const mockedSignatureObject = {
  address: '0xacab',
  message: mockedMessage,
  signature: mockedSignature,
};

const ethersWallet = new Wallet(privateKey);
// @TODO I think we might want to improve this mock typing as we're using private APIs here
const mockedEthersWallet = (ethersWallet as unknown) as MaybeMockedDeep<Wallet>;

const mockedAddressValidator = mocked(addressValidator);
const mockedHexSequenceValidator = mocked(hexSequenceValidator);
const mockedPrivateToPublic = mocked(privateToPublic);
const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);
const mockedWarning = mocked(warning);
const mockedEncrypt = mocked(encrypt);
const mockedSignTransaction = mocked(signTransaction);
const mockedUserInputValidator = mocked(userInputValidator);
const mockedSignMessage = mocked(signMessage);
const mockedVerifyMessage = mocked(verifyMessage);

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
    mockedEthersWallet.signMessage.mockClear();
    mockedEthersWallet.sign.mockClear();
    mockedVerifyMessage.mockClear();
  });
  describe('`SoftwareWallet` Class', () => {
    test('Creates a new wallet', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      expect(testWallet).toBeInstanceOf(SoftwareWallet);
    });
    test('Throws if it cannot create it', async () => {
      mockedAddressValidator.mockImplementationOnce(() => {
        throw new Error();
      });
      expect(() => new SoftwareWallet(ethersWallet, { chainId })).toThrow();
    });
    test('The instance object has the required (correct) props', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      /*
       * Address
       */
      expect(testWallet).toHaveProperty('address');
      /*
       * Private Key
       */
      expect(testWallet).toHaveProperty('privateKey');
      /*
       * Mnemonic
       */
      expect(testWallet).toHaveProperty('mnemonic');
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
    test('Validates the address and private key', () => {
      /* eslint-disable-next-line no-new */
      new SoftwareWallet(ethersWallet, { chainId });
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
    test('Gets the private key', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await expect(testWallet.getPrivateKey()).resolves.toEqual(privateKey);
    });
    test('Gets the derivation path', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await expect(testWallet.getDerivationPath()).resolves.toEqual(
        derivationPath,
      );
    });
    test('Gets the mnemonic', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await expect(testWallet.getMnemonic()).resolves.toEqual(mnemonic);
    });
    test('Gets the public key', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      /*
       * The mocked function returns the value it's passed, in this case the private
       * key, so we can use that to test.
       */
      await expect(testWallet.getPublicKey()).resolves.toEqual(privateKey);
    });
    test('Reverts the public key from the private key', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.getPublicKey();
      expect(privateToPublic).toHaveBeenCalled();
    });
    test('Validates the newly reverted the public key', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.getPublicKey();
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(privateKey);
    });
    test('Normalizes the newly reverted the public key', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.getPublicKey();
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(privateKey);
    });
    test('Gets the keystore', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await expect(testWallet.getKeystore(password)).resolves.toEqual(keystore);
    });
    test("Can't get the keystore if no password was set", async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      /*
       * The promise rejects
       */
      // @ts-ignore
      await expect(testWallet.getKeystore()).rejects.toEqual(
        new Error(walletClass.noPassword),
      );
    });
    test("Uses Ethers's `encrypt()` to generate the keystore", async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.getKeystore(password);
      expect(encrypt).toHaveBeenCalled();
      expect(encrypt).toHaveBeenCalledWith(privateKey, password);
    });
    test('`sign()` calls the correct static method', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.sign(mockedTransactionObject);
      expect(signTransaction).toHaveBeenCalledWith({
        ...mockedTransactionObject,
        callback: expect.any(Function),
      });
    });
    test('Validates `sign` method user input', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.sign(mockedTransactionObject);
      /*
       * Validate the input
       */
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedTransactionObject,
      });
    });
    test('`signMessages()` calls the correct static method', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.signMessage(mockedMessageObject);
      expect(signMessage).toHaveBeenCalledWith({
        message: mockedMessage,
        messageData: mockedMessageData,
        callback: expect.any(Function),
      });
    });
    test('Validate `signMessage` method user input', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
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
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
      await testWallet.verifyMessage(mockedSignatureObject);
      expect(verifyMessage).toHaveBeenCalled();
    });
    test('Validate `verifyMessage` method user input', async () => {
      const testWallet = new SoftwareWallet(ethersWallet, { chainId });
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
