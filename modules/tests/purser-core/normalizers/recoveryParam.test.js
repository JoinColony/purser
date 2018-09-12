import { recoveryParamNormalizer } from '@colony/purser-core/normalizers';

import { SIGNATURE } from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-core/normalizers');

describe('`Core` Module', () => {
  describe('`recoveryParamNormalizer()` normalizer', () => {
    test('Throw if param is not a number', () => {
      expect(() => recoveryParamNormalizer('not-a-number')).toThrow();
      expect(() => recoveryParamNormalizer()).toThrow();
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
