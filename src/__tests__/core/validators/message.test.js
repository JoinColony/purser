import { messageValidator } from '../../../core/validators';

jest.dontMock('../../../core/utils');
jest.dontMock('../../../core/validators');

describe('`Trezor` Hardware Wallet Module Validators', () => {
  describe('`messageValidator()` validator', () => {
    test("Fail if it's not a String", () => {
      expect(() => messageValidator({})).toThrow();
      expect(() => messageValidator(12)).toThrow();
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
