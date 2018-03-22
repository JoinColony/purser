import crypto from 'crypto';

import utils, { warning, getRandomValues } from '../utils';
import * as defaults from '../defaults';

jest.mock('crypto', () => ({}));
jest.dontMock('../utils');

global.console = {
  warn: jest.fn(),
  error: jest.fn(),
};

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
  describe('`warning()` method', () => {
    beforeEach(() => {
      defaults.ENV = 'development';
    });
    afterEach(() => {
      console.warn.mockClear();
      console.error.mockClear();
    });
    test('It logs the correct message', () => {
      warning(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      warning(message);
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      warning(message, { priority: 'high' });
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
    test('It correctly sets the low priority', () => {
      warning(message, { level: 'low' });
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
    test('It correctly sets the high priority', () => {
      warning(message, { level: 'high' });
      expect(console.error).toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });
    test('It correctly falls back to the low priority', () => {
      warning(message, { level: 'lower' });
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      warning(message, { level: 123 });
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      warning(message, { level: 'high', anotherProp: true });
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
    test("It doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      warning(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
    test('It correctly splits out template literals', () => {
      const templateLiterals = ['part', 'part', 'part'];
      warning(
        message,
        templateLiterals[0],
        templateLiterals[1],
        templateLiterals[2],
      );
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(message, ...templateLiterals);
    });
    test('It correctly splits out template literals and priority', () => {
      const templateLiterals = ['part', 'part', 'part'];
      const priority = {
        level: 'high',
      };
      warning(
        message,
        templateLiterals[0],
        templateLiterals[1],
        templateLiterals[2],
        priority,
      );
      expect(console.error).toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(message, ...templateLiterals);
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
