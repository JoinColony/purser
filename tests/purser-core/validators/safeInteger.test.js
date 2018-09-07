import { safeIntegerValidator } from '../../../modules/node_modules/@colony/purser-core/src/validators';

jest.dontMock('../../../modules/node_modules/@colony/purser-core/src/utils');
jest.dontMock('../../../modules/node_modules/@colony/purser-core/src/validators');

describe('`Core` Module', () => {
  describe('`safeIntegerValidator()` validator', () => {
    test("Fail if it's not a Number primitive", () => {
      expect(() => safeIntegerValidator('')).toThrow();
      expect(() => safeIntegerValidator({})).toThrow();
      expect(() => safeIntegerValidator([])).toThrow();
    });
    test("Fail if it's not a positive Number", () => {
      expect(() => safeIntegerValidator(-1)).toThrow();
      expect(() => safeIntegerValidator(-100)).toThrow();
      expect(() => safeIntegerValidator(-1000)).toThrow();
    });
    test("Fail if it's over the safe Integer limit", () => {
      expect(() => safeIntegerValidator(9007199254740992)).toThrow();
      expect(() => safeIntegerValidator(1e16)).toThrow();
    });
    test("But passes if it's a valid Number", () => {
      expect(safeIntegerValidator(0)).toBeTruthy();
      expect(safeIntegerValidator(1000)).toBeTruthy();
      expect(safeIntegerValidator(1e15)).toBeTruthy();
    });
  });
});
