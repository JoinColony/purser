import { addressNormalizer } from '@colony/purser-core/normalizers';

jest.dontMock('@colony/purser-core/utils');
jest.dontMock('@colony/purser-core/normalizers');

const unPrefixedAddress = '586145EBa3A2545cac062EAd7DE0EC184A6C8Af5';
const prefixedAddress = '0x586145EBa3A2545cac062EAd7DE0EC184A6C8Af5';

describe('`Core` Module', () => {
  describe('`addressNormalizer()` normalizer', () => {
    test('Adds a prefix to an Ethereum address', () => {
      expect(addressNormalizer(unPrefixedAddress)).toEqual(prefixedAddress);
    });
    test('Removes prefix to an Ethereum address', () => {
      expect(addressNormalizer(prefixedAddress, false)).toEqual(
        unPrefixedAddress,
      );
    });
  });
});
