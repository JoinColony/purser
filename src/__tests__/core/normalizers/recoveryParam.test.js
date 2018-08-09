import { recoveryParamNormalizer } from '../../../core/normalizers';

import { SIGNATURE } from '../../../core/defaults';

jest.dontMock('../../../core/normalizers');

// const unPrefixedHexString = 'ead7de0ec184a6c8a';
// const prefixedHexString = '0xead7de0ec184a6c8a';

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
