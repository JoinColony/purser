import ethers from 'ethers';

import { legacyCreate } from '../softwareWallet';
import { localhost } from '../providers';
import * as utils from '../utils';

jest.mock('ethers', () => ({ Wallet: {} }));

describe('`software` wallet module', () => {
  describe('`createLegacy` method', () => {
    test('Creates a new wallet by default', () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
      legacyCreate();
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
    });
    test('Creates a new wallet with a manual provider', () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
      const wallet = legacyCreate(localhost());
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(wallet).toHaveProperty('provider');
    });
    test('Creates a new wallet when provider is set to a falsy value', () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
      utils.warn = jest.fn();
      const wallet = legacyCreate(null);
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      expect(wallet).not.toHaveProperty('provider');
    });
    test('Creates a new wallet with manual entrophy', () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
      const entrophy = new Uint8Array(100);
      legacyCreate(localhost(), entrophy);
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalledWith({
        extraEntrophy: entrophy,
      });
    });
    test('Creates a new wallet when entrophy is set to a falsy value', () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
      utils.warn = jest.fn();
      legacyCreate(localhost(), null);
      expect(utils.warn).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalledWith();
    });
    test("Returns new wallet even when there's and error", () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
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
});
