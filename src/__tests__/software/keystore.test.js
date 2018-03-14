import software from '../../software';
import * as utils from '../../utils';

jest.mock('../../utils');

describe('`software` wallet module', () => {
  describe('`SoftwareWallet` Keystore', () => {
    test('Add the keystore prop to the wallet instance', async () => {
      const testWallet = await software.SoftwareWallet.create({
        password: 'encrypt-me-baby',
      });
      const keystoreGetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'keystore',
        'get',
      );
      expect(testWallet).toHaveProperty('keystore');
      expect(await testWallet.keystore).toEqual('{}');
      expect(keystoreGetterSpy).toHaveBeenCalled();
      keystoreGetterSpy.mockReset();
      keystoreGetterSpy.mockRestore();
    });
    test("Can't get the keystore if no password was provided", async () => {
      const testWallet = await software.SoftwareWallet.create({});
      const keystoreGetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'keystore',
        'get',
      );
      expect(testWallet).toHaveProperty('keystore');
      expect(await testWallet.keystore).toEqual(undefined);
      expect(keystoreGetterSpy).toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      keystoreGetterSpy.mockReset();
      keystoreGetterSpy.mockRestore();
    });
    test('Can set the keystore after the wallet was instantiated', async () => {
      const testWallet = await software.SoftwareWallet.create({});
      const keystoreSetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'keystore',
        'set',
      );
      expect(testWallet).toHaveProperty('keystore');
      expect(await testWallet.keystore).toEqual(undefined);
      expect(utils.warn).toHaveBeenCalled();
      testWallet.keystore = 'a-new-encryption-password';
      expect(keystoreSetterSpy).toHaveBeenCalled();
      expect(await testWallet.keystore).toEqual(`{}`);
      keystoreSetterSpy.mockReset();
      keystoreSetterSpy.mockRestore();
    });
  });
});
