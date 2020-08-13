import { messageValidator } from '../../src/validators';

describe('`Core` Module', () => {
  describe('`messageValidator()` validator', () => {
    test("Fail if it's not a String", () => {
      // @ts-ignore
      expect(() => messageValidator({})).toThrow();
      // @ts-ignore
      expect(() => messageValidator(12)).toThrow();
      // @ts-ignore
      expect(() => messageValidator([])).toThrow();
    });
    test("Fail if it's over 1 kB in size", () => {
      expect(() => messageValidator(String(0).repeat(1025))).toThrow();
    });
    test("But passes if it's a valid hex sequence", () => {
      expect(messageValidator('Sign me')).toBeTruthy();
      expect(messageValidator(' ')).toBeTruthy();
    });
  });
});
