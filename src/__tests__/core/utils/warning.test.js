import { warning } from '../../../core/utils';
import * as defaults from '../../../core/defaults';

jest.dontMock('../../../core/utils');

global.console = {
  warn: jest.fn(),
  error: jest.fn(),
};

const message = 'This is a test message';

describe('`Utils` Core Module', () => {
  describe('`warning()` method', () => {
    beforeEach(() => {
      defaults.ENV = 'development';
    });
    afterEach(() => {
      console.warn.mockClear();
      console.error.mockClear();
    });
    test('Logs the correct message', () => {
      warning(message);
      expect(console.warn).toHaveBeenCalledWith(message);
    });
    test("Doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      warning(message);
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      warning(message, { priority: 'high' });
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
    test('Correctly sets the low priority', () => {
      warning(message, { level: 'low' });
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
    test('Correctly sets the high priority', () => {
      warning(message, { level: 'high' });
      expect(console.error).toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });
    test('Correctly falls back to the low priority', () => {
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
    test("Doesn't log a message when in production", () => {
      defaults.ENV = 'production';
      warning(message);
      expect(console.warn).not.toHaveBeenCalled();
    });
    test('Correctly splits out template literals', () => {
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
    test('Correctly splits out template literals and priority', () => {
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
});
