import { Wallet as EthersWalletClass } from 'ethers/wallet';

import { getRandomValues, warning } from '../../core/utils';

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
const password = 'mocked-password';
const privateKey = 'mocked-private-key';

describe('`Software` Wallet Module', () => {
  afterEach(() => {
    SoftwareWalletClass.mockClear();
    EthersWalletClass.createRandom.mockClear();
    getRandomValues.mockClear();
    warning.mockClear();
    // HDNode.fromMnemonic.mockClear();
    // EthersWalletClass.fromEncryptedWallet.mockClear();
    // EthersWalletClass.isEncryptedWallet.mockClear();
  });
  describe('`create()` static method', async () => {
    test('Create a new wallet with defaults', async () => {
      await softwareWallet.create();
      /*
       * Generates entrophy
       */
      expect(getRandomValues).toHaveBeenCalled();
      /*
       * Creates a random Ethers Wallet instance
       */
      expect(EthersWalletClass.createRandom).toHaveBeenCalled();
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
    test('Still creates a wallet even with no entrophy', async () => {
      await softwareWallet.create({ entropy: false });
      /*
       * Doesn't generate randomness since we overwrite it
       */
      expect(getRandomValues).not.toHaveBeenCalled();
      /*
       * But still creates the wallet
       */
      expect(EthersWalletClass.createRandom).toHaveBeenCalled();
      /*
       * But warns the user that this is not ideal
       */
      expect(warning).toHaveBeenCalled();
    });
    test('Sets the encryption password if provided', async () => {
      await softwareWallet.create({ password });
      expect(SoftwareWalletClass).toHaveBeenCalled();
      expect(SoftwareWalletClass).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
          password,
        }),
      );
    });
    test('Throws if something goes wrong', async () => {
      /*
       * We mock the implementation of `createRandom` to simulate throwing an Error
       */
      EthersWalletClass.createRandom.mockImplementation(() => {
        throw new Error();
      });
      expect(softwareWallet.create()).rejects.toThrow();
      expect(SoftwareWalletClass).not.toHaveBeenCalled();
    });
  });
});
