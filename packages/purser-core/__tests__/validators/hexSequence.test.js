import { hexSequenceValidator } from '@colony/purser-core/validators';

jest.dontMock('@colony/purser-core/utils');
jest.dontMock('@colony/purser-core/validators');

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
    test("But passes if it's a valid hex sequence", () => {
      expect(hexSequenceValidator('9d1E3242221f34f7413a')).toBeTruthy();
      expect(hexSequenceValidator('12c')).toBeTruthy();
      expect(hexSequenceValidator('3')).toBeTruthy();
      expect(hexSequenceValidator('')).toBeTruthy();
    });
  });
});
