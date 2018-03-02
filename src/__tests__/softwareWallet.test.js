import ethers from 'ethers';

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
  Wallet.prototype.encrypt = jest.fn(
    password =>
      new Promise((resolve, reject) => {
        if (password) {
          return resolve(`{}`);
        }
        return reject();
      }),
  );
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
  describe('`SoftwareWallet` Class', () => {
    test('Creates a new wallet', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      expect(ethers.Wallet).toHaveBeenCalled();
      expect(wallet.SoftwareWallet).toHaveBeenCalled();
      expect(testWallet).toBeInstanceOf(wallet.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(ethers.Wallet);
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
      /*
       * A little trick to simulate an error during creation
       */
      utils.warn = jest.fn(() => {
        throw new Error();
      });
      utils.error = jest.fn();
      wallet.SoftwareWallet.create({ provider: null });
      expect(utils.warn).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(wallet.SoftwareWallet.createRandom).toHaveBeenCalledWith();
    });
    test('Add the keystore prop to the wallet instance', () => {
      const testWallet = wallet.SoftwareWallet.create({
        password: 'encrypt-me-baby',
      });
      const keystoreGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'keystore',
        'get',
      );
      expect(testWallet).toHaveProperty('keystore');
      expect(testWallet.keystore).resolves.toEqual('{}');
      expect(keystoreGetterSpy).toHaveBeenCalled();
      keystoreGetterSpy.mockReset();
      keystoreGetterSpy.mockRestore();
    });
    test("Can't get the keystore if no password was provided", () => {
      const testWallet = wallet.SoftwareWallet.create({});
      const keystoreGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'keystore',
        'get',
      );
      expect(testWallet).toHaveProperty('keystore');
      expect(testWallet.keystore).resolves.toEqual(undefined);
      expect(keystoreGetterSpy).toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      keystoreGetterSpy.mockReset();
      keystoreGetterSpy.mockRestore();
    });
    test('Can set the keystore after the wallet was instantiated', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      const keystoreSetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'keystore',
        'set',
      );
      expect(testWallet).toHaveProperty('keystore');
      expect(testWallet.keystore).resolves.toEqual(undefined);
      expect(utils.warn).toHaveBeenCalled();
      testWallet.keystore = 'a-new-encryption-password';
      expect(keystoreSetterSpy).toHaveBeenCalled();
      expect(testWallet.keystore).resolves.toEqual(`{}`);
      keystoreSetterSpy.mockReset();
      keystoreSetterSpy.mockRestore();
    });
  });
  describe('`create` method', () => {
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
