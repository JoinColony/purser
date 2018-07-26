import crypto from 'crypto';

import { getRandomValues } from '../../../core/utils';

jest.mock('crypto', () => ({}));
jest.dontMock('../../../core/utils');

describe('`Utils` Core Module', () => {
  describe('`getRandomValues()` polyfill method', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('Selects the Chrome `webcrypto` method, when available', () => {
      window.crypto = {
        getRandomValues: jest.fn(),
      };
      const randomnessArray = new Uint8Array(10);
      getRandomValues(randomnessArray);
      expect(window.crypto.getRandomValues).toHaveBeenCalled();
      expect(window.crypto.getRandomValues).toHaveBeenCalledWith(
        randomnessArray,
      );
    });
    test('Selects the Microsoft `msCrypto` method, when available', () => {
      window.crypto = undefined;
      window.msCrypto = {
        getRandomValues: jest.fn(),
      };
      const randomnessArray = new Uint8Array(10);
      getRandomValues(randomnessArray);
      expect(window.msCrypto.getRandomValues).toHaveBeenCalled();
      expect(window.msCrypto.getRandomValues).toHaveBeenCalledWith(
        randomnessArray,
      );
    });
    test('If no `crypto` method is found, generate JS based random', () => {
      window.crypto = undefined;
      window.msCrypto = undefined;
      crypto.randomBytes = undefined;
      const randomnessArray = new Uint8Array(10);
      const arraySpy = jest.spyOn(randomnessArray, 'map');
      getRandomValues(randomnessArray);
      expect(arraySpy).toHaveBeenCalled();
    });
  });
});
