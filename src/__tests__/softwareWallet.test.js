import ethers from 'ethers';

import { legacyCreate } from '../softwareWallet';
import { localhost } from '../providers';

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
    test('Creates a new wallet with manual entrophy', () => {
      ethers.Wallet.createRandom = jest.fn(() => ({}));
      const entrophy = new Uint8Array(100);
      legacyCreate(localhost(), entrophy);
      expect(ethers.Wallet.createRandom).toHaveBeenCalled();
      expect(ethers.Wallet.createRandom).toHaveBeenCalledWith({
        extraEntrophy: entrophy,
      });
    });
  });
});
