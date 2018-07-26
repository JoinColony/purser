import { derivationPathValidator } from '../../../core/validators';

jest.dontMock('../../../core/utils');
jest.dontMock('../../../core/validators');

describe('`Trezor` Hardware Wallet Module Validators', () => {
  describe('`derivationPathValidator()` validator', () => {
    test("Fail if it's an empty String", () => {
      expect(() => derivationPathValidator('')).toThrow();
    });
    test("Fail if it's not a String type", () => {
      expect(() => derivationPathValidator(44)).toThrow();
    });
    test("Fail if it doesn't have the correct number of parts", () => {
      expect(() => derivationPathValidator('m/44')).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/0'/")).toThrow();
    });
    test("Fail if it doesn't have the correct header key", () => {
      expect(() => derivationPathValidator("a/44'/60'/0'/0/0")).toThrow();
      expect(() => derivationPathValidator("/44'/60'/0'/0/0")).toThrow();
    });
    test("Fail if it doesn't have the correct purpose", () => {
      expect(() => derivationPathValidator("m/4'/60'/0'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/'/60'/0'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/ab'/60'/0'/0/0")).toThrow();
    });
    test("Fail if it doesn't have the correct coin type", () => {
      expect(() => derivationPathValidator("m/44'/600'/0'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/6'/0'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/'/0'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/0'/0'/0/0")).toThrow();
    });
    test("Fail if it doesn't have the correct account value", () => {
      expect(() => derivationPathValidator("m/44'/60'/a'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/12a'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/'/0/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/0/0/0/0")).toThrow();
    });
    test("Fail if it doesn't have the correct change and address index", () => {
      expect(() => derivationPathValidator("m/44'/60'/0'/a/0")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/0'/0/a")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/0'/a")).toThrow();
      expect(() => derivationPathValidator("m/44'/60'/0'//")).toThrow();
      expect(() =>
        derivationPathValidator("M/44'/60'/0'/0/00/0/00/1/2/0/1"),
      ).toThrow();
    });
    test("But passes if it's a valid derivation path", () => {
      expect(derivationPathValidator("m/44'/60'/0'/0")).toBeTruthy();
      expect(derivationPathValidator("m/44'/60'/0'/0/0")).toBeTruthy();
      expect(derivationPathValidator("m/44'/60'/0'/0/1")).toBeTruthy();
      expect(derivationPathValidator("m/44'/60'/0'/1/0")).toBeTruthy();
      expect(derivationPathValidator("m/44'/1'/0'/1/0")).toBeTruthy();
      expect(derivationPathValidator("m/44'/1'/1'/2/0")).toBeTruthy();
    });
  });
});
