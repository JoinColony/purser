import crypto from 'crypto';

import { getRandomValues } from '../../src/utils';

jest.mock('crypto', () => ({}));

// @ts-ignore
window.crypto = {
  getRandomValues: jest.fn(),
};
// @ts-ignore
window.msCrypto = {
  getRandomValues: jest.fn(),
};

describe('`Core` Module', () => {
  describe('`getRandomValues()` util', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('Selects the Chrome `webcrypto` method, when available', () => {
      const randomnessArray = new Uint8Array(10);
      getRandomValues(randomnessArray);
      expect(window.crypto.getRandomValues).toHaveBeenCalled();
      expect(window.crypto.getRandomValues).toHaveBeenCalledWith(
        randomnessArray,
      );
    });
    test('Selects the Microsoft `msCrypto` method, when available', () => {
      window.crypto.getRandomValues = undefined;
      const randomnessArray = new Uint8Array(10);
      getRandomValues(randomnessArray);
      // @ts-ignore
      expect(window.msCrypto.getRandomValues).toHaveBeenCalled();
      // @ts-ignore
      expect(window.msCrypto.getRandomValues).toHaveBeenCalledWith(
        randomnessArray,
      );
    });
    test('If no `crypto` method is found, generate JS based random', () => {
      window.crypto.getRandomValues = undefined;
      // @ts-ignore
      window.msCrypto = undefined;
      crypto.randomBytes = undefined;
      const randomnessArray = new Uint8Array(10);
      const arraySpy = jest.spyOn(randomnessArray, 'map');
      getRandomValues(randomnessArray);
      expect(arraySpy).toHaveBeenCalled();
    });
  });
});
