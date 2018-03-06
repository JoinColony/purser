import { Wallet as EthersWallet } from 'ethers/wallet';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import wallet, { create } from '../softwareWallet';
import { localhost } from '../providers';
import * as utils from '../utils';

/*
 * @TODO Move all mocks to separate files / folder
 * They are kind of getting out of hand already, and it will only get worse
 */
jest.mock('ethers/wallet');

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(
    value =>
      new Promise((resolve, reject) => {
        if (value) {
          return resolve('base64');
        }
        return reject();
      }),
  ),
}));

jest.mock('ethereum-blockies', () => ({
  create: jest.fn(() => ({
    toDataURL: jest.fn(() => 'base64'),
  })),
}));

jest.mock('../utils');

let SoftwareWalletCreateSpy;

describe('`software` wallet module', () => {
  beforeEach(() => {
    SoftwareWalletCreateSpy = jest.spyOn(wallet.SoftwareWallet, 'create');
  });
  afterEach(() => {
    SoftwareWalletCreateSpy.mockReset();
    SoftwareWalletCreateSpy.mockRestore();
    qrcode.toDataURL.mockClear();
    blockies.create.mockClear();
  });
  /*
   * @TODO Split this tests file into a more manageable format
   * This will only get bigger and harder to find stuff into with time...
   */
  /*
   * Main class
   */
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
     * Keystore
     */
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
    /*
     * Address QR
     */
    test('Add the `addressQR` prop to the wallet instance', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      testWallet.address = '0x123';
      const addressQRGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'addressQR',
        'get',
      );
      expect(testWallet).toHaveProperty('addressQR');
      expect(testWallet.addressQR).resolves.toEqual('base64');
      expect(addressQRGetterSpy).toHaveBeenCalled();
      expect(qrcode.toDataURL).toHaveBeenCalled();
      addressQRGetterSpy.mockReset();
      addressQRGetterSpy.mockRestore();
    });
    test("Can't get the QR code if no address is available", () => {
      const testWallet = wallet.SoftwareWallet.create({});
      const addressQRGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'addressQR',
        'get',
      );
      expect(testWallet).toHaveProperty('addressQR');
      expect(testWallet.addressQR).resolves.toEqual(undefined);
      expect(addressQRGetterSpy).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(qrcode.toDataURL).not.toHaveBeenCalled();
      addressQRGetterSpy.mockReset();
      addressQRGetterSpy.mockRestore();
    });
    /*
     * Blockie
     */
    test('Add the `blockie` prop to the wallet instance', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      testWallet.address = '0x123';
      const blockieGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'blockie',
        'get',
      );
      expect(testWallet).toHaveProperty('blockie');
      expect(testWallet.blockie).resolves.toEqual('base64');
      expect(blockieGetterSpy).toHaveBeenCalled();
      expect(blockies.create).toHaveBeenCalled();
      blockieGetterSpy.mockReset();
      blockieGetterSpy.mockRestore();
    });
    test("Can't get the blockie if no address is available", () => {
      const testWallet = wallet.SoftwareWallet.create({});
      const blockieGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'blockie',
        'get',
      );
      expect(testWallet).toHaveProperty('blockie');
      expect(testWallet.blockie).resolves.toEqual(undefined);
      expect(blockieGetterSpy).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(blockies.create).not.toHaveBeenCalled();
      blockieGetterSpy.mockReset();
      blockieGetterSpy.mockRestore();
    });
    /*
     * Private Key QR
     */
    test('Add the `privateKeyQR` prop to the wallet instance', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      testWallet.privateKey = '0x321';
      const privateKeyQRGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'privateKeyQR',
        'get',
      );
      expect(testWallet).toHaveProperty('privateKeyQR');
      expect(testWallet.privateKeyQR).resolves.toEqual('base64');
      expect(privateKeyQRGetterSpy).toHaveBeenCalled();
      expect(qrcode.toDataURL).toHaveBeenCalled();
      privateKeyQRGetterSpy.mockReset();
      privateKeyQRGetterSpy.mockRestore();
    });
    test("Can't get the QR code if no private key is available", () => {
      const testWallet = wallet.SoftwareWallet.create({});
      const privateKeyQRGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'privateKeyQR',
        'get',
      );
      expect(testWallet).toHaveProperty('privateKeyQR');
      expect(testWallet.privateKeyQR).resolves.toEqual(undefined);
      expect(privateKeyQRGetterSpy).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(qrcode.toDataURL).not.toHaveBeenCalled();
      privateKeyQRGetterSpy.mockReset();
      privateKeyQRGetterSpy.mockRestore();
    });
  });
  /*
   * Create
   */
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
