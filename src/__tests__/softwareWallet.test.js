import ethers from 'ethers';

import { legacyCreate, openWithPrivateKey } from '../softwareWallet';
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

describe('`software` wallet module', () => {
  beforeEach(() => {
    utils.warn.mockReset();
    utils.error.mockReset();
  });
  describe('`createLegacy` method', () => {
    test('Creates a new wallet by default', () => {
      legacyCreate();
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
    });
    test('Creates a new wallet with a manual provider', () => {
      const wallet = legacyCreate(localhost());
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(wallet).toHaveProperty('provider');
    });
    test('Creates a new wallet when provider is set to a falsy value', () => {
      const wallet = legacyCreate(null);
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      expect(wallet).not.toHaveProperty('provider');
    });
    test('Creates a new wallet with manual entrophy', () => {
      const entrophy = new Uint8Array(100);
      legacyCreate(localhost(), entrophy);
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalledWith({
        extraEntrophy: entrophy,
      });
    });
    test('Creates a new wallet when entrophy is set to a falsy value', () => {
      legacyCreate(localhost(), null);
      expect(utils.warn).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalledWith();
    });
    test("Returns new wallet even when there's and error", () => {
      /*
       * A little try to simulate an error during creation
       */
      utils.warn = jest.fn(() => {
        throw new Error();
      });
      utils.error = jest.fn();
      const wallet = legacyCreate(null);
      expect(utils.warn).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalledWith();
      expect(wallet).not.toHaveProperty('provider');
    });
  });
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
});
