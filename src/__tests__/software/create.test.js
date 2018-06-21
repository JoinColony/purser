import software, { create } from '../../software';
import { jsonRpc } from '../../providers';

let SoftwareWalletCreateSpy;

describe('`software` wallet module', () => {
  beforeEach(() => {
    SoftwareWalletCreateSpy = jest.spyOn(software.SoftwareWallet, 'create');
  });
  afterEach(() => {
    SoftwareWalletCreateSpy.mockReset();
    SoftwareWalletCreateSpy.mockRestore();
  });
  describe('`SoftwareWallet` Create Method ', () => {
    test('Creates a new wallet by default', () => {
      create();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalledWith({});
    });
    test('Creates a new wallet with a provider', () => {
      const provider = jsonRpc();
      create({ provider });
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalledWith({ provider });
    });
    test('Creates a new wallet with an encryption password', () => {
      const password = 'encryyyyyypt';
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
    test('The new wallet to have the mnemonic and path props', async () => {
      const testWallet = await create();
      expect(SoftwareWalletCreateSpy).toHaveBeenCalled();
      expect(testWallet).toHaveProperty('mnemonic');
      expect(testWallet).toHaveProperty('path');
    });
  });
});
