import { bigNumber } from '@colony/purser-core/utils';
import { bigNumberValidator } from '@colony/purser-core/validators';

jest.dontMock('@colony/purser-core/utils');
jest.dontMock('@colony/purser-core/validators');

describe('`Core` Module', () => {
  describe('`bigNumberValidator()` validator', () => {
    test("Fail if it's not an instance of the `bigNumber` util", () => {
      expect(() => bigNumberValidator('')).toThrow();
      expect(() => bigNumberValidator({})).toThrow();
      expect(() => bigNumberValidator(12)).toThrow();
    });
    test("But passes if it's a valid bigNumber", () => {
      expect(bigNumberValidator(bigNumber(0))).toBeTruthy();
      expect(bigNumberValidator(bigNumber('0'))).toBeTruthy();
      expect(bigNumberValidator(bigNumber('9007199254740992'))).toBeTruthy();
    });
  });
});
