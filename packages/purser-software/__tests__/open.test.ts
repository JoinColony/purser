import { Wallet as EthersWallet } from 'ethers/wallet';
import { isValidMnemonic, fromMnemonic } from 'ethers/utils/hdnode';
import { isSecretStorageWallet } from 'ethers/utils/json-wallet';
import { mocked } from 'ts-jest/utils';

import { userInputValidator } from '../../purser-core/src/helpers';
import { REQUIRED_PROPS as REQUIRED_PROPS_SOFTWARE } from '../src/constants';

import SoftwareWallet from '../src/SoftwareWallet';
import { open } from '../src';

jest.mock('ethers/wallet');
jest.mock('ethers/utils/hdnode');
jest.mock('ethers/utils/json-wallet');
jest.mock('../src/SoftwareWallet');
jest.mock('../../purser-core/src/helpers');
jest.mock('../../purser-core/src/utils');

const MockedSoftwareWallet = mocked(SoftwareWallet);
const MockedEthersWallet = mocked(EthersWallet);
const mockedFromMnemonic = mocked(fromMnemonic);
const mockedIsValidMnemonic = mocked(isValidMnemonic);
const mockedIsSecretStorageWallet = mocked(isSecretStorageWallet);
const mockedUserInputValidator = mocked(userInputValidator);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const privateKey = 'mocked-private-key';
const password = 'mocked-password';
const mnemonic = 'mocked-mnemonic';
const keystore = 'mocked-keystore';
const mockedArgumentsObject = {
  privateKey,
};

describe('`Software` Wallet Module', () => {
  afterEach(() => {
    MockedSoftwareWallet.mockClear();
    MockedEthersWallet.mockClear();
    mockedFromMnemonic.mockClear();
    mockedIsValidMnemonic.mockClear();
    MockedEthersWallet.fromEncryptedJson.mockClear();
    mockedIsSecretStorageWallet.mockClear();
    mockedUserInputValidator.mockClear();
  });
  describe('`open()` static method', () => {
    test('Open a wallet with a private key', async () => {
      await open({ privateKey });
      /*
       * Creates a Ethers Wallet instance
       */
      expect(EthersWallet).toHaveBeenCalled();
      expect(EthersWallet).toHaveBeenCalledWith(privateKey);
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWallet).toHaveBeenCalled();
      expect(SoftwareWallet).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
        }),
      );
    });
    test('Open a wallet with a mnemonic', async () => {
      await open({ mnemonic });
      /*
       * Extract the private key from the mnemonic
       */
      expect(fromMnemonic).toHaveBeenCalled();
      expect(fromMnemonic).toHaveBeenCalledWith(mnemonic);
      /*
       * Uses the extracted private key to create a Ethers Wallet instance
       */
      expect(EthersWallet).toHaveBeenCalled();
      expect(EthersWallet).toHaveBeenCalledWith(privateKey);
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWallet).toHaveBeenCalled();
      expect(SoftwareWallet).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
          originalMnemonic: mnemonic,
        }),
      );
    });
    test('Checks if the mnemonic is valid', async () => {
      await open({ mnemonic });
      /*
       * Checks if the passed mnemonic is valid
       */
      expect(isValidMnemonic).toHaveBeenCalled();
      expect(isValidMnemonic).toHaveBeenCalledWith(mnemonic);
    });
    test('Open a wallet with a keystore', async () => {
      await open({ keystore, password });
      /*
       * Create a new wallet instance from the (now decrypted) keystore
       */
      expect(EthersWallet.fromEncryptedJson).toHaveBeenCalled();
      expect(EthersWallet.fromEncryptedJson).toHaveBeenCalledWith(
        keystore,
        password,
      );
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWallet).toHaveBeenCalled();
      expect(SoftwareWallet).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
          keystore,
          password,
        }),
      );
    });
    test('Checks if the keystore is valid', async () => {
      await open({ keystore, password });
      /*
       * Checks if the passed keystore is valid
       */
      expect(isSecretStorageWallet).toHaveBeenCalled();
      expect(isSecretStorageWallet).toHaveBeenCalledWith(keystore);
    });
    test("Validate the user's input", async () => {
      await open(mockedArgumentsObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArgumentsObject,
        requiredEither: REQUIRED_PROPS_SOFTWARE.OPEN_WALLET,
      });
    });
    test('Throws if no valid method of opening is provided', async () => {
      await expect(open()).rejects.toThrow();
      expect(SoftwareWallet).not.toHaveBeenCalled();
    });
  });
});
