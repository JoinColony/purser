import { verbose } from '../../src/utils';
import * as constants from '../../src/constants';

// @ts-ignore
global.console = {
  warn: jest.fn(),
  error: jest.fn(),
};

describe('`Core` Module', () => {
  describe('`verbose()` util', () => {
    test('Should be verbose if the environment is not defined', () => {
      const env = constants.ENV;
      // @ts-ignore
      constants.ENV = undefined;
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
      // @ts-ignore
      constants.ENV = env;
    });
    test("Should be verbose if we're in a development environment", () => {
      const env = constants.ENV;
      // @ts-ignore
      constants.ENV = 'development';
      const isVerbose = verbose();
      expect(isVerbose).toBeTruthy();
      // @ts-ignore
      constants.ENV = env;
    });
    test("Should NOT be verbose if we're not in `development` env", () => {
      const env = constants.ENV;
      // @ts-ignore
      constants.ENV = 'production';
      let isVerbose = verbose();
      expect(isVerbose).not.toBeTruthy();
      // @ts-ignore
      constants.ENV = 'testing';
      isVerbose = verbose();
      expect(isVerbose).not.toBeTruthy();
      // @ts-ignore
      constants.ENV = env;
    });
  });
});
