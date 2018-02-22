import { verbose, warn, error } from '../utils';
import * as defaults from '../defaults';

const message = 'This is a test message';

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
      warn(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      warn(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
  describe('`error()` method', () => {
    beforeEach(() => {
      defaults.ENV = 'development';
      console.error = jest.fn();
    });
    test('It logs the correct message', () => {
      error(message);
      expect(console.error).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      error(message);
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
