import BN from 'bn.js';

import { bigNumber } from '../../utils';
import * as defaults from '../../defaults';

jest.dontMock('bn.js');
jest.dontMock('../../utils');

describe('`Utils` Core Module', () => {
  describe('`bigNumber()` method', () => {
    test('Returns a (modified) instance of BN', () => {
      expect(bigNumber(0)).toBeInstanceOf(BN);
    });
    test('Has the extra instance methods', () => {
      const bigNumberInstance = bigNumber(0);
      expect(bigNumberInstance).toHaveProperty('toWei');
      expect(bigNumberInstance).toHaveProperty('fromWei');
      expect(bigNumberInstance).toHaveProperty('toGwei');
      expect(bigNumberInstance).toHaveProperty('fromGwei');
    });
    test('Correctly converts to WEI', () => {
      const bigNumberWei = bigNumber(1)
        .toWei()
        .toString();
      expect(bigNumberWei).toEqual(`${defaults.WEI_MINIFICATION}`);
    });
    test('Correctly converts from WEI', () => {
      const bigNumberValue = bigNumber(`${defaults.WEI_MINIFICATION}`)
        .fromWei()
        .toString();
      expect(bigNumberValue).toEqual(`1`);
    });
    test('Correctly converts to GWEI', () => {
      const bigNumberGwei = bigNumber(1)
        .toGwei()
        .toString();
      expect(bigNumberGwei).toEqual(`${defaults.GWEI_MINIFICATION}`);
    });
    test('Correctly converts from GWEI', () => {
      const bigNumberValue = bigNumber(`${defaults.GWEI_MINIFICATION}`)
        .fromGwei()
        .toString();
      expect(bigNumberValue).toEqual(`1`);
    });
  });
});
