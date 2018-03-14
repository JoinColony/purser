import software, { open } from '../../software';
import { localhost } from '../../providers';

let SoftwareWalletOpenSpy;

describe('`software` wallet module', () => {
  beforeEach(() => {
    SoftwareWalletOpenSpy = jest.spyOn(software.SoftwareWallet, 'open');
  });
  afterEach(() => {
    SoftwareWalletOpenSpy.mockReset();
    SoftwareWalletOpenSpy.mockRestore();
  });
  describe('`SoftwareWallet` Create Method ', () => {
    test('Open a wallet with a private key', () => {
      const privateKey = '0x1';
      open({ privateKey });
      expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
      expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({ privateKey });
    });
    test('Open a wallet with a private key while adding a provider', () => {
      const provider = localhost();
      const privateKey = '0x1';
      open({ provider, privateKey });
      expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
      expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({
        privateKey,
        provider,
      });
    });
    /*
     * I have prettier sometimes... :(
     */
    /* prettier-ignore */
    test(
      'Open a wallet with a private key while adding an encryption password',
      () => {
        const password = 'encrypt---';
        const privateKey = '0x1';
        open({ password, privateKey });
        expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
        expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({
          privateKey,
          password,
        });
      }
    );
    test('Open a wallet with a mnemonic', () => {
      const mnemonic = 'defense noodle gadget';
      open({ mnemonic });
      expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
      expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({ mnemonic });
    });
  });
});
