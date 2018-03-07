import { Wallet as EthersWallet } from 'ethers/wallet';

import wallet from '../../softwareWallet';
import { localhost } from '../../providers';
import * as utils from '../../utils';

jest.mock('ethers/wallet');
jest.mock('../../utils');

describe('`software` wallet module', () => {
  describe('`SoftwareWallet` Class', () => {
    test('Creates a new wallet', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      expect(EthersWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(testWallet).toBeInstanceOf(wallet.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(EthersWallet);
    });
    test('Creates a new wallet with a manual provider', () => {
      const provider = localhost();
      wallet.SoftwareWallet.create({ provider });
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalledWith(undefined, provider);
    });
    test('Creates a new wallet when provider is set to a falsy value', () => {
      wallet.SoftwareWallet.create({ provider: false });
      expect(utils.warn).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalledWith(undefined, undefined);
    });
    test('Creates a new wallet with manual entrophy', () => {
      utils.getRandomValues = jest.fn(value => value);
      const entrophy = new Uint8Array(100);
      wallet.SoftwareWallet.create({ entrophy });
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalledWith({
        extraEntrophy: entrophy,
      });
      utils.getRandomValues.mockClear();
    });
    test('Creates a new wallet when entrophy is set to a falsy value', () => {
      wallet.SoftwareWallet.create({ entrophy: false });
      expect(utils.warn).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalledWith();
    });
    test("Returns new wallet even when there's and error", () => {
      wallet.SoftwareWallet.create({ provider: { error: true } });
      expect(utils.error).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalledWith();
    });
  });
});
