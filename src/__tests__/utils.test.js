import { warn, error } from '../utils';

const message = 'This is a test message';

describe('`utils` module', () => {
  describe('`warn()` method', () => {
    beforeEach(() => {
      window.ENV = 'dev';
      console.warn = jest.fn();
    });
    test('It logs the correct message', () => {
      warn(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      window.ENV = 'prod';
      warn(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
  describe('`error()` method', () => {
    beforeEach(() => {
      window.ENV = 'dev';
      console.error = jest.fn();
    });
    test('It logs the correct message', () => {
      error(message);
      expect(console.error).toHaveBeenCalledWith(message);
    });
    test("It doesn't log a message when in production", () => {
      window.ENV = 'prod';
      error(message);
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
