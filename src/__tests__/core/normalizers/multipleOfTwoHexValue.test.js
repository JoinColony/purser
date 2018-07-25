import { multipleOfTwoHexValueNormalizer } from '../../../core/normalizers';

jest.dontMock('../../../utils');
jest.dontMock('../../../core/normalizers');

describe('`Trezor` Hardware Wallet Module Normalizers', () => {
  describe('`multipleOfTwoHexValueNormalizer()` normalizer', () => {
    test("Makes a hex string's length even by padding it with a '0'", () => {
      const oddLengthHexString = '9ACAeb9';
      expect(multipleOfTwoHexValueNormalizer(oddLengthHexString)).toEqual(
        `0${oddLengthHexString}`,
      );
    });
    test("But it leaves it as-is if it's lenght is already even", () => {
      const evenLengthHexString = '9ACAeb91';
      expect(multipleOfTwoHexValueNormalizer(evenLengthHexString)).toEqual(
        evenLengthHexString,
      );
    });
  });
});
