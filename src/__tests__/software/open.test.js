import software, { open } from '../../software';
import { jsonRpc } from '../../providers';

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
    test('Open a wallet with a private key', async () => {
      const privateKey = '0x1';
      await open({ privateKey });
      expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
      expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({ privateKey });
    });
    /*
     * I hate prettier sometimes... :(
     */
    /* prettier-ignore */
    test(
      'Open a wallet with a private key while adding a provider',
      async () => {
        const provider = jsonRpc();
        const privateKey = '0x1';
        await open({ provider, privateKey });
        expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
        expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({
          privateKey,
          provider,
        });
      },
    );
    /*
     * I hate prettier sometimes... :(
     */
    /* prettier-ignore */
    test(
      'Open a wallet with a private key while adding an encryption password',
      async () => {
        const password = 'encrypt---';
        const privateKey = '0x1';
        await open({ password, privateKey });
        expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
        expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({
          privateKey,
          password,
        });
      },
    );
    test('Open a wallet with a mnemonic', async () => {
      const mnemonic = 'romeo delta india golf';
      await open({ mnemonic });
      expect(SoftwareWalletOpenSpy).toHaveBeenCalled();
      expect(SoftwareWalletOpenSpy).toHaveBeenCalledWith({ mnemonic });
    });
  });
});
