import { HDNode, Wallet as EthersWalletClass } from 'ethers/wallet';

import SoftwareWalletClass from '../../software/class';
import softwareWallet from '../../software';

jest.dontMock('../../software/index');

jest.mock('ethers/wallet');
jest.mock('../../software/class');
jest.mock('../../core/helpers');
jest.mock('../../core/utils');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const privateKey = 'mocked-private-key';
const password = 'mocked-password';
const mnemonic = 'mocked-mnemonic';
const keystore = 'mocked-keystore';

describe('`Software` Wallet Module', () => {
  afterEach(() => {
    SoftwareWalletClass.mockClear();
    EthersWalletClass.mockClear();
    HDNode.fromMnemonic.mockClear();
    EthersWalletClass.fromEncryptedWallet.mockClear();
    EthersWalletClass.isEncryptedWallet.mockClear();
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
      expect(HDNode.fromMnemonic).toHaveBeenCalled();
      expect(HDNode.fromMnemonic).toHaveBeenCalledWith(mnemonic);
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
          mnemonic,
        }),
      );
    });
    test('Checks if the mnemonic is valid', async () => {
      await softwareWallet.open({ mnemonic });
      /*
       * Checks if the passed mnemonic is valid
       */
      expect(HDNode.isValidMnemonic).toHaveBeenCalled();
      expect(HDNode.isValidMnemonic).toHaveBeenCalledWith(mnemonic);
    });
    test('Open a wallet with a keystore', async () => {
      await softwareWallet.open({ keystore, password });
      /*
       * Create a new wallet instance from the (now decrypted) keystore
       */
      expect(EthersWalletClass.fromEncryptedWallet).toHaveBeenCalled();
      expect(EthersWalletClass.fromEncryptedWallet).toHaveBeenCalledWith(
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
      expect(EthersWalletClass.isEncryptedWallet).toHaveBeenCalled();
      expect(EthersWalletClass.isEncryptedWallet).toHaveBeenCalledWith(
        keystore,
      );
    });
    test('Throws if no valid method of opening is provided', async () => {
      expect(softwareWallet.open()).rejects.toThrow();
      expect(SoftwareWalletClass).not.toHaveBeenCalled();
    });
  });
});
