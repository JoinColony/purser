import { Wallet as EthersWallet, HDNode } from 'ethers/wallet';

import software from '../../software';
import { localhost } from '../../providers';
import * as utils from '../../utils';
import { PROVIDER_PROTO, MNEMONIC_PATH } from '../../defaults';

jest.mock('ethers/wallet');
jest.mock('../../utils');
jest.dontMock('../../software');

describe('`software` wallet module', () => {
  afterEach(() => {
    EthersWallet.mockClear();
    HDNode.fromMnemonic.mockClear();
    software.SoftwareWallet.mockClear();
  });
  describe('`SoftwareWallet` Class', () => {
    /*
     * Create
     */
    test('Creates a new wallet', async () => {
      const testWallet = await software.SoftwareWallet.create({});
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(testWallet).toBeInstanceOf(software.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(EthersWallet);
    });
    test('Creates a new wallet with a manual provider', () => {
      const provider = localhost();
      software.SoftwareWallet.create({ provider });
      expect(software.SoftwareWallet).toHaveBeenCalled();
      /*
       * `0x1` is the value the `createRandom()` mock returns
       */
      expect(software.SoftwareWallet).toHaveBeenCalledWith('0x1', provider);
    });
    test('Creates a new wallet with a provider generator function', () => {
      const providerMock = jest.fn(() => () => ({ mocked: true }));
      software.SoftwareWallet.create({ provider: providerMock });
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(providerMock).toHaveBeenCalled();
    });
    test('Creates a new wallet when provider is set to a falsy value', () => {
      software.SoftwareWallet.create({ provider: false });
      expect(utils.warning).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      /*
       * `0x1` is the value the `createRandom()` mock returns
       */
      expect(software.SoftwareWallet).toHaveBeenCalledWith('0x1', undefined);
    });
    test('Creates a new wallet with manual entropy', () => {
      const entropy = new Uint8Array(100);
      software.SoftwareWallet.create({ entropy });
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalledWith({
        extraEntropy: entropy,
      });
    });
    test('Creates a new wallet when entropy is set to a falsy value', () => {
      software.SoftwareWallet.create({ entropy: false });
      expect(utils.warning).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalledWith();
    });
    test("Returns new wallet even when there's and error", () => {
      software.SoftwareWallet.create({ provider: { error: true } });
      expect(utils.warning).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalledWith();
    });
    /*
     * Open
     */
    test('Opens wallet using a private key', async () => {
      const privateKey = '0x1';
      const testWallet = await software.SoftwareWallet.open({ privateKey });
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalledWith(
        privateKey,
        PROVIDER_PROTO,
      );
      expect(testWallet).toBeInstanceOf(software.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(EthersWallet);
    });
    test('Opens wallet using a mnemonic', () => {
      const mnemonic = 'romeo delta india golf';
      const privateKey = '0x1';
      software.SoftwareWallet.open({ mnemonic });
      expect(HDNode.fromMnemonic).toHaveBeenCalled();
      expect(HDNode.fromMnemonic).toHaveBeenCalledWith(mnemonic);
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalledWith(
        privateKey,
        PROVIDER_PROTO,
      );
    });
    test('Opens wallet using a keystore', async () => {
      const keystore = '{"address":"123456"}';
      const password = 'passsword';
      await software.SoftwareWallet.open({ keystore, password });
      expect(software.SoftwareWallet.isEncryptedWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet.fromEncryptedWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet.fromEncryptedWallet).toHaveBeenCalledWith(
        keystore,
        password,
      );
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
    });
    test('Return undefined when no suitable open method provided', async () => {
      const testWallet = software.SoftwareWallet.open({});
      expect(HDNode.fromMnemonic).not.toHaveBeenCalled();
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalledWith(
        undefined,
        PROVIDER_PROTO,
      );
      expect(utils.warning).toHaveBeenCalled();
      expect(testWallet).rejects.toEqual(new Error());
    });
    test('After open, the wallet should have the `mnemonic` prop', async () => {
      const mnemonic = 'romeo delta india golf';
      const testWalletKey = await software.SoftwareWallet.open({
        privateKey: '0x1',
      });
      const testWalletMnemonic = await software.SoftwareWallet.open({
        mnemonic,
      });
      expect(testWalletKey).toBeInstanceOf(software.SoftwareWallet);
      expect(testWalletMnemonic).toBeInstanceOf(software.SoftwareWallet);
      expect(testWalletKey).toHaveProperty('mnemonic', undefined);
      expect(testWalletKey).toHaveProperty('path', MNEMONIC_PATH);
      expect(testWalletMnemonic).toHaveProperty('mnemonic', mnemonic);
      expect(testWalletMnemonic).toHaveProperty('path', MNEMONIC_PATH);
    });
  });
});
