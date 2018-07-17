import { derivationPathNormalizer } from '../../../trezor/normalizers';

jest.dontMock('../../../utils');
jest.dontMock('../../../trezor/normalizers');

describe('`Trezor` Hardware Wallet Module', () => {
  describe('`derivationPathNormalizer()` normalizer', () => {
    test('Normalizes the header key', () => {
      const abnormalDerivationPath = "M/44'/60'/0'/0";
      const normalDerivationPath = "m/44'/60'/0'/0";
      expect(derivationPathNormalizer(abnormalDerivationPath)).toEqual(
        normalDerivationPath,
      );
    });
    test('Normalizes the coin type', () => {
      const abnormalDerivationPath = "m/44'/060'/0'/0";
      const normalDerivationPath = "m/44'/60'/0'/0";
      expect(derivationPathNormalizer(abnormalDerivationPath)).toEqual(
        normalDerivationPath,
      );
    });
    test('Normalizes the account id', () => {
      const abnormalDerivationPath = "m/44'/1'/01'/0";
      const normalDerivationPath = "m/44'/1'/1'/0";
      expect(derivationPathNormalizer(abnormalDerivationPath)).toEqual(
        normalDerivationPath,
      );
    });
    test('Normalizes the change', () => {
      const abnormalDerivationPath = "m/44'/60'/0'/00";
      const normalDerivationPath = "m/44'/60'/0'/0";
      expect(derivationPathNormalizer(abnormalDerivationPath)).toEqual(
        normalDerivationPath,
      );
    });
    test('Normalizes the address index', () => {
      const abnormalDerivationPath = "m/44'/60'/0'/0/0001";
      const normalDerivationPath = "m/44'/60'/0'/0/1";
      expect(derivationPathNormalizer(abnormalDerivationPath)).toEqual(
        normalDerivationPath,
      );
    });
    test('Cuts overflowing account index', () => {
      const abnormalDerivationPath = "m/44'/60'/0'/0/1/2/3/4/5";
      const normalDerivationPath = "m/44'/60'/0'/0/1";
      expect(derivationPathNormalizer(abnormalDerivationPath)).toEqual(
        normalDerivationPath,
      );
    });
  });
});
