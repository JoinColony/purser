import { addressNormalizer } from '../../../core/normalizers';

jest.dontMock('../../../core/utils');
jest.dontMock('../../../core/normalizers');

const unPrefixedAddress = '586145EBa3A2545cac062EAd7DE0EC184A6C8Af5';
const prefixedAddress = '0x586145EBa3A2545cac062EAd7DE0EC184A6C8Af5';

describe('`Trezor` Hardware Wallet Module Normalizers', () => {
  describe('`addressNormalizer()` normalizer', () => {
    test('Adds a prefix to an ethereum address', () => {
      expect(addressNormalizer(unPrefixedAddress)).toEqual(prefixedAddress);
    });
    test('Removes prefix to an ethereum address', () => {
      expect(addressNormalizer(prefixedAddress, false)).toEqual(
        unPrefixedAddress,
      );
    });
  });
});
