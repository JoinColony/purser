import { assertTruth } from '@colony/purser-core/utils';
import * as defaults from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-core/utils');

global.console = {
  warn: jest.fn(),
};

const errorMessage = 'mocked-error-message';

describe('`Core` Module', () => {
  describe('`assertTruth()` util', () => {
    afterEach(() => {
      console.warn.mockReset();
      console.warn.mockRestore();
    });
    test('Stops execution if assertion fails and level is set to high', () => {
      const badAssertion = () =>
        assertTruth({
          expression: false,
          message: errorMessage,
          level: 'high',
        });
      expect(badAssertion).toThrow();
      expect(badAssertion).toThrowError(errorMessage);
    });
    test('Warns if assertion fails and level is set to low', () => {
      defaults.ENV = 'development';
      const badAssertion = assertTruth({
        expression: false,
        message: errorMessage,
        level: 'low',
      });
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(errorMessage);
      expect(badAssertion).toBeFalsy();
    });
    test('Messages can be passed in as an Array', () => {
      defaults.ENV = 'development';
      const errorsArray = [errorMessage, errorMessage, errorMessage];
      assertTruth({
        expression: false,
        message: errorsArray,
        level: 'low',
      });
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(...errorsArray);
    });
    test('Returns true if the expression is also true', () => {
      const goodAssertion = assertTruth({
        expression: true,
      });
      expect(console.warn).not.toHaveBeenCalled();
      expect(() => goodAssertion).not.toThrow();
      expect(goodAssertion).toBeTruthy();
    });
  });
});
