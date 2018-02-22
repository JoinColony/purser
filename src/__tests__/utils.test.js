import { verbose, warn, error } from '../utils';

const message = 'This is a test message';

describe('`utils` module', () => {
  describe('`verbose()` helper method', () => {
    test('It should be verbose if the environment is not defined', () => {
      window.ENV = undefined;
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
    });
    test("It should be verbose if we're in a development environment", () => {
      window.ENV = 'development';
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
    });
    test(
      "It should NOT be verbose if we're in a any kind of other" +
        "environment (other than 'development')",
      () => {
        window.ENV = 'production';
        let isVerbose = verbose();
        expect(isVerbose).not.toBeTruthy();
        window.ENV = 'testing';
        isVerbose = verbose();
        expect(isVerbose).not.toBeTruthy();
      },
    );
  });
  describe('`warn()` method', () => {
    beforeEach(() => {
      window.ENV = 'development';
      console.warn = jest.fn();
    });
    test('It logs the correct message', () => {
      warn(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      window.ENV = 'production';
      warn(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
  describe('`error()` method', () => {
    beforeEach(() => {
      window.ENV = 'development';
      console.error = jest.fn();
    });
    test('It logs the correct message', () => {
      error(message);
      expect(console.error).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      window.ENV = 'production';
      error(message);
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
