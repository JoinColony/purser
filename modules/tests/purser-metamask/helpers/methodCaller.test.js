import * as helpers from '@colony/purser-metamask/helpers';

jest.dontMock('@colony/purser-metamask/helpers');

/*
 * We just need this method mocked, but since it's declared in a module we
 * need to test we have do do this little go-around trick and use the default export
 *
 * See: https://github.com/facebook/jest/issues/936
 */
helpers.default.detect = jest.fn(() => true);

const { methodCaller } = helpers;

const mockedCallback = jest.fn();

describe('Metamask` Wallet Module', () => {
  describe('`methodCaller()` helper method', () => {
    afterEach(() => {
      helpers.default.detect.mockClear();
      mockedCallback.mockClear();
    });
    test('If it detects Metamask, it executes the callback', async () => {
      methodCaller(mockedCallback);
      expect(mockedCallback).toHaveBeenCalled();
    });
    test("If it doesn't, it throws", async () => {
      helpers.default.detect.mockImplementation(() => {
        throw new Error();
      });
      expect(() => methodCaller(mockedCallback)).toThrow();
    });
    test('It has a customized error message for throwing', async () => {
      const mockedErrorMessage = 'Oh no!';
      const customizedError = 'The horror...';
      helpers.default.detect.mockImplementation(() => {
        throw new Error(mockedErrorMessage);
      });
      expect(() => methodCaller(mockedCallback, customizedError)).toThrowError(
        `${customizedError} Error: ${mockedErrorMessage}`,
      );
    });
  });
});
