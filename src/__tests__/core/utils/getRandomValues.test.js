import crypto from 'crypto';

import { getRandomValues } from '../../../core/utils';

jest.mock('crypto', () => ({}));
jest.dontMock('../../../core/utils');

global.console = {
  warn: jest.fn(),
  error: jest.fn(),
};

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
    test('Selects the nodeJS `crypto` library as a fallack', () => {
      window.crypto = undefined;
      window.msCrypto = undefined;
      const randomnessArray = new Uint8Array(10);
      crypto.randomBytes = jest.fn(() => randomnessArray);
      getRandomValues(randomnessArray);
      expect(crypto.randomBytes).toHaveBeenCalled();
      expect(crypto.randomBytes).toHaveBeenCalledWith(randomnessArray.length);
    });
    test('Using nodeJS `crypto`, throws if array is not an uint8', () => {
      window.crypto = undefined;
      window.msCrypto = undefined;
      const randomnessArray = new Array(10);
      expect(() => getRandomValues(randomnessArray)).toThrow();
    });
    test('If no `crypto` method is found, throw', () => {
      window.crypto = undefined;
      window.msCrypto = undefined;
      crypto.randomBytes = undefined;
      const randomnessArray = new Uint8Array(10);
      expect(() => getRandomValues(randomnessArray)).toThrow();
    });
  });
});
