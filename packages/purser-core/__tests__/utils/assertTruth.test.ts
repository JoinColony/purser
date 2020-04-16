import * as utils from '../../src/utils';

const { assertTruth } = utils;

const consoleSpy = jest.spyOn(utils, 'warning').mockImplementation(jest.fn());

const errorMessage = 'mocked-error-message';

describe('`Core` Module', () => {
  describe('`assertTruth()` util', () => {
    afterEach(() => {
      consoleSpy.mockReset();
    });
    test('Stops execution if assertion fails and level is set to high', () => {
      const badAssertion = (): boolean =>
        assertTruth({
          expression: false,
          message: errorMessage,
          level: 'high',
        });
      expect(badAssertion).toThrow();
      expect(badAssertion).toThrowError(errorMessage);
    });
    test('Warns if assertion fails and level is set to low', () => {
      const badAssertion = assertTruth({
        expression: false,
        message: errorMessage,
        level: 'low',
      });
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(errorMessage);
      expect(badAssertion).toBeFalsy();
    });
    test('Messages can be passed in as an Array', () => {
      const errorsArray = [errorMessage, errorMessage, errorMessage];
      assertTruth({
        expression: false,
        message: errorsArray,
        level: 'low',
      });
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(...errorsArray);
    });
    test('Returns true if the expression is also true', () => {
      const goodAssertion = assertTruth({
        expression: true,
        message: '',
        level: '',
      });
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(() => goodAssertion).not.toThrow();
      expect(goodAssertion).toBeTruthy();
    });
  });
});
