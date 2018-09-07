import { verbose } from '@colony/purser-core/utils';
import * as defaults from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-core/utils');

global.console = {
  warn: jest.fn(),
  error: jest.fn(),
};

describe('`Core` Module', () => {
  describe('`verbose()` util', () => {
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
    test("Should NOT be verbose if we're not in `development` env", () => {
      defaults.ENV = 'production';
      let isVerbose = verbose();
      expect(isVerbose).not.toBeTruthy();
      defaults.ENV = 'testing';
      isVerbose = verbose();
      expect(isVerbose).not.toBeTruthy();
    });
  });
});
