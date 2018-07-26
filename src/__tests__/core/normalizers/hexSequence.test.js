import { hexSequenceNormalizer } from '../../../core/normalizers';

jest.dontMock('../../../core/utils');
jest.dontMock('../../../core/normalizers');

const unPrefixedHexString = 'ead7de0ec184a6c8a';
const prefixedHexString = '0xead7de0ec184a6c8a';

describe('`Trezor` Hardware Wallet Module Normalizers', () => {
  describe('`addressNormalizer()` normalizer', () => {
    test('Adds a prefix to an hex string seqeunce', () => {
      expect(hexSequenceNormalizer(unPrefixedHexString)).toEqual(
        prefixedHexString,
      );
    });
    test('Removes prefix to an hex string seqeunce', () => {
      expect(hexSequenceNormalizer(prefixedHexString, false)).toEqual(
        unPrefixedHexString,
      );
    });
  });
});
