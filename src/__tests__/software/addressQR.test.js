import qrcode from 'qrcode';

import software from '../../software';
import * as utils from '../../utils';

jest.mock('qrcode');
jest.mock('../../utils');

describe('`software` wallet module', () => {
  afterEach(() => {
    qrcode.toDataURL.mockClear();
  });
  describe('`SoftwareWallet` Address QR', () => {
    test('Add the `addressQR` prop to the wallet instance', async () => {
      const testWallet = await software.SoftwareWallet.create({});
      testWallet.address = '0x123';
      const addressQRGetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'addressQR',
        'get',
      );
      expect(testWallet).toHaveProperty('addressQR');
      expect(await testWallet.addressQR).toEqual('base64');
      expect(addressQRGetterSpy).toHaveBeenCalled();
      expect(qrcode.toDataURL).toHaveBeenCalled();
      addressQRGetterSpy.mockReset();
      addressQRGetterSpy.mockRestore();
    });
    test("Can't get the QR code if no address is available", async () => {
      const testWallet = await software.SoftwareWallet.create({});
      const addressQRGetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'addressQR',
        'get',
      );
      expect(testWallet.addressQR).rejects.toEqual(undefined);
      expect(addressQRGetterSpy).toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      expect(qrcode.toDataURL).not.toHaveBeenCalled();
      addressQRGetterSpy.mockReset();
      addressQRGetterSpy.mockRestore();
    });
  });
});
