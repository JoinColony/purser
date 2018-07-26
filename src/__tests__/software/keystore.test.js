import software from '../../software';
import * as utils from '../../core/utils';

/*
 * Manual mocking a manual mock. Yay for Jest being build by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../core/utils', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__mocks-required__/utils'),
);

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
      expect(testWallet.keystore).rejects.toEqual(undefined);
      expect(keystoreGetterSpy).toHaveBeenCalled();
      expect(utils.warning).toHaveBeenCalled();
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
      expect(testWallet.keystore).rejects.toEqual(undefined);
      expect(utils.warning).toHaveBeenCalled();
      testWallet.keystore = 'a-new-encryption-password';
      expect(keystoreSetterSpy).toHaveBeenCalled();
      expect(await testWallet.keystore).toEqual(`{}`);
      keystoreSetterSpy.mockReset();
      keystoreSetterSpy.mockRestore();
    });
    test('Expect value to be set if opening wallet with keystore', async () => {
      const keystore = '{"address":"123456"}';
      const password = 'passsword';
      const testWallet = await software.SoftwareWallet.open({
        keystore,
        password,
      });
      expect(await testWallet.keystore).toEqual(keystore);
    });
  });
});
