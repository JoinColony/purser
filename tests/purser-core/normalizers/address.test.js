import { addressNormalizer } from '../../../modules/node_modules/@colony/purser-core/src/normalizers';

jest.dontMock('../../../modules/node_modules/@colony/purser-core/src/utils');
jest.dontMock(
  '../../../modules/node_modules/@colony/purser-core/src/normalizers',
);

const unPrefixedAddress = '586145EBa3A2545cac062EAd7DE0EC184A6C8Af5';
const prefixedAddress = '0x586145EBa3A2545cac062EAd7DE0EC184A6C8Af5';

describe('`Core` Module', () => {
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
