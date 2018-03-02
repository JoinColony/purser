/* import ethers from 'ethers'; */

import wallet, { create } from '../softwareWallet';
import { localhost } from '../providers';
import * as utils from '../utils';

jest.mock('ethers', () => {
  const Wallet = jest.fn().mockImplementation(privatekey => {
    if (privatekey === '0x0') {
      throw new Error();
    }
    return this;
  });
  Wallet.createRandom = jest.fn(() => ({}));
  return { Wallet };
});

jest.mock('../utils');

let SoftwareWalletCreateSpy;

describe('`software` wallet module', () => {
  beforeEach(() => {
    utils.warn.mockReset();
    utils.error.mockReset();
    SoftwareWalletCreateSpy = jest.spyOn(wallet.SoftwareWallet, 'create');
  });
  afterEach(() => {
    SoftwareWalletCreateSpy.mockReset();
    SoftwareWalletCreateSpy.mockRestore();
  });
  describe('`createLegacy` method', () => {
    test('Creates a new wallet by default', () => {
      create();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalledWith({});
    });
    test('Creates a new wallet with a provider', () => {
      const provider = localhost();
      create({ provider });
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalledWith({ provider });
    });
    test('Creates a new wallet with an encryption password', () => {
      const password = localhost();
      create({ password });
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalledWith({ password });
    });
    test('Creates a new wallet with manual entrophy', () => {
      const entrophy = new Uint8Array(100);
      create({ entrophy });
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalledWith({ entrophy });
    });
  });

  /*
   * @TODO Re-enable wallet unit tests after refactoring
   *
  describe('`openWithPrivateKey` method', () => {
    test('Opens the wallet with the provided private key', () => {
      const mockPrivateKey = '0x1';
      const wallet = openWithPrivateKey(mockPrivateKey, localhost());
      expect(wallet).toBeInstanceOf(ethers.Wallet);
      expect(ethers.Wallet).toHaveBeenCalled();
      expect(ethers.Wallet).toHaveBeenCalledWith(mockPrivateKey, localhost());
    });
    test('Opens the wallet without setting a provider', () => {
      const mockPrivateKey = '0x1';
      const wallet = openWithPrivateKey(mockPrivateKey, null);
      expect(wallet).toBeInstanceOf(ethers.Wallet);
      expect(ethers.Wallet).toHaveBeenCalled();
      expect(ethers.Wallet).toHaveBeenCalledWith(mockPrivateKey);
      expect(utils.warn).toHaveBeenCalled();
    });
    test('Recovers if there was an error opening the wallet', () => {
      const mockPrivateKey = '0x0';
      const wallet = openWithPrivateKey(mockPrivateKey, null);
      expect(wallet).not.toBeInstanceOf(ethers.Wallet);
      expect(ethers.Wallet).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(wallet).toBeUndefined();
    });
  });
  */
});
