import { derivationPathSerializer } from '../../../core/helpers';

jest.dontMock('../../../core/helpers');

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  describe('`derivationPathSerializer()` helper', () => {
    test('Generates a derivation path without an address index', () => {
      const serializedDerivationPath = derivationPathSerializer({
        purpose: 0,
        coinType: 0,
        account: 0,
        change: 0,
      });
      expect(serializedDerivationPath).toEqual(`m/0'/0'/0'/0`);
    });
    test('Generates a derivation path with an address index', () => {
      const serializedDerivationPath = derivationPathSerializer({
        purpose: 0,
        coinType: 0,
        account: 0,
        change: 0,
        addressIndex: 0,
      });
      expect(serializedDerivationPath).toEqual(`m/0'/0'/0'/0/0`);
    });
    test('Generates a default derivation path', () => {
      const serializedDerivationPath = derivationPathSerializer();
      expect(serializedDerivationPath).toEqual(`m/44'/60'/0'/0`);
    });
  });
});
