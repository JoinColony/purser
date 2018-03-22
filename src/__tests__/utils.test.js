import crypto from 'crypto';

import utils, { warning, getRandomValues } from '../utils';
import * as defaults from '../defaults';

jest.mock('crypto', () => ({}));
jest.dontMock('../utils');

const message = 'This is a test message';

const { verbose } = utils;

describe('`utils` module', () => {
  describe('`verbose()` helper method', () => {
    test('It should be verbose if the environment is not defined', () => {
      defaults.ENV = undefined;
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
    });
    test("It should be verbose if we're in a development environment", () => {
      defaults.ENV = 'development';
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
    });
    test(
      "It should NOT be verbose if we're in a any kind of other" +
        "environment (other than 'development')",
      () => {
        defaults.ENV = 'production';
        let isVerbose = verbose();
        expect(isVerbose).not.toBeTruthy();
        defaults.ENV = 'testing';
        isVerbose = verbose();
        expect(isVerbose).not.toBeTruthy();
      },
    );
  });
  describe('`warn()` method', () => {
    beforeEach(() => {
      defaults.ENV = 'development';
      console.warn = jest.fn();
    });
    test('It logs the correct message', () => {
      warning(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      warning(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
  describe('`getRandomValues()` polyfill method', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('It selects the Chrome `webcrypto` method, when available', () => {
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
    test('It selects the Microsoft `msCrypto` method, when available', () => {
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
    test('It selects the nodeJS `crypto` library as a fallack', () => {
      window.crypto = undefined;
      window.msCrypto = undefined;
      const randomnessArray = new Uint8Array(10);
      crypto.randomBytes = jest.fn(() => randomnessArray);
      getRandomValues(randomnessArray);
      expect(crypto.randomBytes).toHaveBeenCalled();
      expect(crypto.randomBytes).toHaveBeenCalledWith(randomnessArray.length);
    });
    test('Using nodeJS `crypto` it throws if array is not an uint8', () => {
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
