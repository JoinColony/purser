import * as helpers from '../../src/helpers';

const mockDetect = jest
  .spyOn(helpers, 'detect')
  .mockImplementation(() => Promise.resolve(true));

const { methodCaller } = helpers;

const mockedCallback = jest.fn();

describe('Metamask` Wallet Module', () => {
  describe('`methodCaller()` helper method', () => {
    afterEach(() => {
      mockDetect.mockClear();
      mockedCallback.mockClear();
    });
    test('If it detects Metamask, it executes the callback', async () => {
      await methodCaller(mockedCallback);
      expect(mockedCallback).toHaveBeenCalled();
    });
    test("If it doesn't, it throws", async () => {
      mockDetect.mockImplementation(async () => {
        throw new Error();
      });
      expect(methodCaller(mockedCallback)).rejects.toThrow();
    });
    test('It has a customized error message for throwing', async () => {
      const mockedErrorMessage = 'Oh no!';
      const customizedError = 'The horror...';
      mockDetect.mockImplementation(async () => {
        throw new Error(mockedErrorMessage);
      });
      expect(
        methodCaller(mockedCallback, customizedError),
      ).rejects.toThrowError(`${customizedError} Error: ${mockedErrorMessage}`);
    });
  });
});
