import utils from '../../utils';
import * as defaults from '../../defaults';

jest.dontMock('../../utils');

global.console = {
  warn: jest.fn(),
  error: jest.fn(),
};

const { verbose } = utils;

describe('`Utils` Core Module', () => {
  describe('`verbose()` method', () => {
    test('Should be verbose if the environment is not defined', () => {
      defaults.ENV = undefined;
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
    });
    test("Should be verbose if we're in a development environment", () => {
      defaults.ENV = 'development';
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
    });
    test(
      "Should NOT be verbose if we're in a any kind of other" +
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
});
