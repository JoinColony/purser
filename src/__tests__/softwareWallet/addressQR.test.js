import qrcode from 'qrcode';

import wallet from '../../softwareWallet';
import * as utils from '../../utils';

jest.mock('qrcode');
jest.mock('../../utils');

describe('`software` wallet module', () => {
  afterEach(() => {
    qrcode.toDataURL.mockClear();
  });
  describe('`SoftwareWallet` Address QR', () => {
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
  });
});
