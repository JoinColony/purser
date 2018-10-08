import { Wallet as EthersWalletClass } from 'ethers/wallet';
import { isValidMnemonic, fromMnemonic } from 'ethers/utils/hdnode';
import { isSecretStorageWallet } from 'ethers/utils/json-wallet';

import { userInputValidator } from '@colony/purser-core/helpers';

import SoftwareWalletClass from '@colony/purser-software/class';
import softwareWallet from '@colony/purser-software';

import {
  /*
   * Prettier again suggests a fix that would break eslint's max line lenght rule.
   * So we have to trick it again with a comment :)
   */
  REQUIRED_PROPS as REQUIRED_PROPS_SOFTWARE,
} from '@colony/purser-software/defaults';

jest.dontMock('@colony/purser-software/index');

jest.mock('ethers/wallet');
jest.mock('ethers/utils/hdnode');
jest.mock('ethers/utils/json-wallet');
jest.mock('@colony/purser-software/class');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);

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
    SoftwareWalletClass.mockClear();
    EthersWalletClass.mockClear();
    fromMnemonic.mockClear();
    isValidMnemonic.mockClear();
    EthersWalletClass.fromEncryptedJson.mockClear();
    isSecretStorageWallet.mockClear();
    userInputValidator.mockClear();
  });
  describe('`open()` static method', async () => {
    test('Open a wallet with a private key', async () => {
      await softwareWallet.open({ privateKey });
      /*
       * Creates a Ethers Wallet instance
       */
      expect(EthersWalletClass).toHaveBeenCalled();
      expect(EthersWalletClass).toHaveBeenCalledWith(privateKey);
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWalletClass).toHaveBeenCalled();
      expect(SoftwareWalletClass).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
        }),
      );
    });
    test('Open a wallet with a mnemonic', async () => {
      await softwareWallet.open({ mnemonic });
      /*
       * Extract the private key from the mnemonic
       */
      expect(fromMnemonic).toHaveBeenCalled();
      expect(fromMnemonic).toHaveBeenCalledWith(mnemonic);
      /*
       * Uses the extracted private key to create a Ethers Wallet instance
       */
      expect(EthersWalletClass).toHaveBeenCalled();
      expect(EthersWalletClass).toHaveBeenCalledWith(privateKey);
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWalletClass).toHaveBeenCalled();
      expect(SoftwareWalletClass).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
          originalMnemonic: mnemonic,
        }),
      );
    });
    test('Checks if the mnemonic is valid', async () => {
      await softwareWallet.open({ mnemonic });
      /*
       * Checks if the passed mnemonic is valid
       */
      expect(isValidMnemonic).toHaveBeenCalled();
      expect(isValidMnemonic).toHaveBeenCalledWith(mnemonic);
    });
    test('Open a wallet with a keystore', async () => {
      await softwareWallet.open({ keystore, password });
      /*
       * Create a new wallet instance from the (now decrypted) keystore
       */
      expect(EthersWalletClass.fromEncryptedJson).toHaveBeenCalled();
      expect(EthersWalletClass.fromEncryptedJson).toHaveBeenCalledWith(
        keystore,
        password,
      );
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWalletClass).toHaveBeenCalled();
      expect(SoftwareWalletClass).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
          keystore,
          password,
        }),
      );
    });
    test('Checks if the keystore is valid', async () => {
      await softwareWallet.open({ keystore, password });
      /*
       * Checks if the passed keystore is valid
       */
      expect(isSecretStorageWallet).toHaveBeenCalled();
      expect(isSecretStorageWallet).toHaveBeenCalledWith(keystore);
    });
    test("Validate the user's input", async () => {
      await softwareWallet.open(mockedArgumentsObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArgumentsObject,
        requiredEither: REQUIRED_PROPS_SOFTWARE.OPEN_WALLET,
      });
    });
    test('Throws if no valid method of opening is provided', async () => {
      expect(softwareWallet.open()).rejects.toThrow();
      expect(SoftwareWalletClass).not.toHaveBeenCalled();
    });
  });
});
