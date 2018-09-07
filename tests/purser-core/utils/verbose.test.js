import { verbose } from '../../../modules/node_modules/@colony/purser-core/src/utils';
import * as defaults from '../../../modules/node_modules/@colony/purser-core/src/defaults';

jest.dontMock('../../../modules/node_modules/@colony/purser-core/src/utils');

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
