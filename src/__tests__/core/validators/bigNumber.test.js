import { bigNumber } from '../../../utils';
import { bigNumberValidator } from '../../../core/validators';

jest.dontMock('../../../utils');
jest.dontMock('../../../core/validators');

describe('`Trezor` Hardware Wallet Module Validators', () => {
  describe('`bigNumberValidator()` validator', () => {
    test("Fail if it's not an instance of the `bigNumber` util", () => {
      expect(() => bigNumberValidator('')).toThrow();
      expect(() => bigNumberValidator({})).toThrow();
      expect(() => bigNumberValidator(12)).toThrow();
    });
    test("But passes if it's a valid bigNumber", () => {
      expect(bigNumberValidator(bigNumber(0))).toBeTruthy();
      expect(bigNumberValidator(bigNumber('0'))).toBeTruthy();
      expect(bigNumberValidator(bigNumber('1e18'))).toBeTruthy();
      expect(bigNumberValidator(bigNumber('9007199254740992'))).toBeTruthy();
    });
  });
});
