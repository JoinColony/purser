import { derivationPathSerializer } from '../../src/helpers';

describe('`Core` Module', () => {
  describe('`derivationPathSerializer()` helper', () => {
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      'Generates a derivation path without change and  address index',
      () => {
        const serializedDerivationPath = derivationPathSerializer({
          purpose: 0,
          coinType: 0,
          account: 0,
        });
        expect(serializedDerivationPath).toEqual(`m/0'/0'/0'/`);
      },
    );
    /* eslint-enable prettier/prettier */
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
      expect(serializedDerivationPath).toEqual(`m/44'/60'/0'/`);
    });
  });
});
