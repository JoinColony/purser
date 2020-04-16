import { recoveryParamNormalizer } from '../../src/normalizers';

import { SIGNATURE } from '../../src/defaults';

describe('`Core` Module', () => {
  describe('`recoveryParamNormalizer()` normalizer', () => {
    test('Throw if param is not a number', () => {
      // We're testing irregular values deliberately here. So ts-ignore is ok.
      // @ts-ignore
      expect(() => recoveryParamNormalizer('not-a-number')).toThrow();
      // @ts-ignore
      expect(() => recoveryParamNormalizer()).toThrow();
      // @ts-ignore
      expect(() => recoveryParamNormalizer([])).toThrow();
    });
    test('If 0 return the signature recovery odd value', () => {
      const normalizedRecoveryParam = recoveryParamNormalizer(0);
      expect(normalizedRecoveryParam).toEqual(SIGNATURE.RECOVERY_ODD);
    });
    test('If 1 return the signature recovery even value', () => {
      const normalizedRecoveryParam = recoveryParamNormalizer(1);
      expect(normalizedRecoveryParam).toEqual(SIGNATURE.RECOVERY_EVEN);
    });
    test('Return the initial value otherwise', () => {
      const normalizedRecoveryParam = recoveryParamNormalizer(42);
      expect(normalizedRecoveryParam).toEqual(42);
    });
  });
});
