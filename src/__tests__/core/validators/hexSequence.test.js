import { hexSequenceValidator } from '../../../core/validators';

jest.dontMock('../../../core/utils');
jest.dontMock('../../../core/validators');

describe('`Core` Module', () => {
  describe('`hexSequenceValidator()` validator', () => {
    test("Fail if it's not a String", () => {
      expect(() => hexSequenceValidator({})).toThrow();
      expect(() => hexSequenceValidator(12)).toThrow();
      expect(() => hexSequenceValidator([])).toThrow();
    });
    test("Fail if it's contains non-hex characters", () => {
      expect(() => hexSequenceValidator('g')).toThrow();
      expect(() => hexSequenceValidator('h')).toThrow();
    });
    test("Fail if it's over 1 kB in size", () => {
      expect(() => hexSequenceValidator(String(0).repeat(1025))).toThrow();
    });
    test("But passes if it's a valid hex sequence", () => {
      expect(hexSequenceValidator('9d1E3242221f34f7413a')).toBeTruthy();
      expect(hexSequenceValidator('12c')).toBeTruthy();
      expect(hexSequenceValidator('3')).toBeTruthy();
      expect(hexSequenceValidator('')).toBeTruthy();
    });
  });
});
