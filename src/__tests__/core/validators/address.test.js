import { addressValidator } from '../../../core/validators';

jest.dontMock('../../../utils');
jest.dontMock('../../../core/validators');

describe('`Trezor` Hardware Wallet Module Validators', () => {
  describe('`addressValidator()` validator', () => {
    test("Fail if it's not a String", () => {
      expect(() => addressValidator({})).toThrow();
      expect(() => addressValidator(12)).toThrow();
      expect(() => addressValidator([])).toThrow();
    });
    test("Fail if it's not the correct length", () => {
      expect(() => addressValidator(String(0).repeat(10))).toThrow();
      expect(() => addressValidator(String(0).repeat(41))).toThrow();
      expect(() => addressValidator(String(0).repeat(43))).toThrow();
      expect(() => addressValidator(String(0).repeat(50))).toThrow();
    });
    test("Fail if it's contains non-hex characters", () => {
      expect(() =>
        addressValidator('0x000000000000000000000000000000000000000g'),
      ).toThrow();
      expect(() =>
        addressValidator('000000000000000000000000000000000000000h'),
      ).toThrow();
    });
    test("But passes if it's a valid address", () => {
      expect(
        addressValidator('0xAe8fE520435911cff55C9d1E3242221f34f7413a'),
      ).toBeTruthy();
      expect(
        addressValidator('04285375D169ACAeb93858aBE08cc3e9179AFF19'),
      ).toBeTruthy();
    });
  });
});
