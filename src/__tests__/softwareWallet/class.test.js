import { Wallet as EthersWallet, HDNode } from 'ethers/wallet';

import wallet from '../../softwareWallet';
import { localhost } from '../../providers';
import * as utils from '../../utils';
import { PROVIDER_PROTO, MNEMONIC_PATH } from '../../defaults';

jest.mock('ethers/wallet');
jest.mock('../../utils');

describe('`software` wallet module', () => {
  afterEach(() => {
    EthersWallet.mockClear();
    HDNode.fromMnemonic.mockClear();
  });
  describe('`SoftwareWallet` Class', () => {
    /*
     * Create
     */
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
    test('Creates a new wallet with a provider generator function', () => {
      const providerMock = jest.fn(() => () => ({ mocked: true }));
      wallet.SoftwareWallet.create({ provider: providerMock });
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(providerMock).toHaveBeenCalled();
    });
    test('Creates a new wallet when provider is set to a falsy value', () => {
      wallet.SoftwareWallet.create({ provider: false });
      expect(utils.warn).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalledWith(undefined, undefined);
    });
    test('Creates a new wallet with manual entrophy', () => {
      const entrophy = new Uint8Array(100);
      wallet.SoftwareWallet.create({ entrophy });
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalledWith({
        extraEntrophy: entrophy,
      });
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
    /*
     * Open
     */
    test('Opens wallet using a private key', () => {
      const privateKey = '0x1';
      const testWallet = wallet.SoftwareWallet.open({ privateKey });
      expect(EthersWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalledWith(
        privateKey,
        PROVIDER_PROTO,
      );
      expect(testWallet).toBeInstanceOf(wallet.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(EthersWallet);
    });
    test('Opens wallet using a mnemonic', () => {
      const mnemonic = 'romeo delta india golf';
      const privateKey = '0x1';
      wallet.SoftwareWallet.open({ mnemonic });
      expect(HDNode.fromMnemonic).toHaveBeenCalled();
      expect(HDNode.fromMnemonic).toHaveBeenCalledWith(mnemonic);
      expect(EthersWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalledWith(
        privateKey,
        PROVIDER_PROTO,
      );
    });
    test('Return undefined when no suitable open method provided', () => {
      const testWallet = wallet.SoftwareWallet.open({});
      expect(HDNode.fromMnemonic).not.toHaveBeenCalled();
      expect(EthersWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalledWith('', PROVIDER_PROTO);
      expect(utils.error).toHaveBeenCalled();
      expect(testWallet).toEqual(undefined);
    });
    test('After opening the wallet should have the `mnemonic` prop', () => {
      const mnemonic = 'romeo delta india golf';
      const testWalletKey = wallet.SoftwareWallet.open({ privateKey: '0x1' });
      const testWalletMnemonic = wallet.SoftwareWallet.open({ mnemonic });
      expect(testWalletKey).toBeInstanceOf(wallet.SoftwareWallet);
      expect(testWalletMnemonic).toBeInstanceOf(wallet.SoftwareWallet);
      expect(testWalletKey).toHaveProperty('mnemonic', undefined);
      expect(testWalletKey).toHaveProperty('path', MNEMONIC_PATH);
      expect(testWalletMnemonic).toHaveProperty('mnemonic', mnemonic);
      expect(testWalletMnemonic).toHaveProperty('path', MNEMONIC_PATH);
    });
  });
});
