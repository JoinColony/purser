import { userInputValidator } from '@colony/purser-core/helpers';
import { warning } from '@colony/purser-core/utils';

jest.dontMock('@colony/purser-core/helpers');

/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils.js'),
);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedPropValue = 'mocked-prop-value';
const mockedRequiredProps = ['mockedProp'];
const mockedArgument = {
  mockedProp: mockedPropValue,
};

describe('`Core` Module', () => {
  describe('`userInputValidator()` helper', () => {
    afterEach(() => {
      warning.mockClear();
    });
    test('Continues operation if first argument is an Object', () => {
      /*
       * Does not throw if it's actually an object
       */
      expect(() =>
        userInputValidator({
          firstArgument: mockedArgument,
        }),
      ).not.toThrow();
      /*
       * Doesn't warn the user, since no error occured
       */
      expect(warning).not.toHaveBeenCalled();
    });
    test('Errors out if the first argument is not an Object', () => {
      /*
       * Throws if it's anything but an object
       */
      expect(() =>
        userInputValidator({
          firstArgument: [123],
        }),
      ).toThrow();
      expect(() =>
        userInputValidator({
          firstArgument: ['a random string'],
        }),
      ).toThrow();
      /*
       * And also warns the user
       */
      expect(warning).toHaveBeenCalled();
    });
    test('Continues if at least one of the required prop is available', () => {
      expect(() =>
        userInputValidator({
          firstArgument: mockedArgument,
          requiredEither: mockedRequiredProps,
        }),
      ).not.toThrow();
    });
    test('Errors out if none of the required prop is available', () => {
      expect(() =>
        userInputValidator({
          firstArgument: { mockedPropWithDifferentName: mockedPropValue },
          requiredEither: mockedRequiredProps,
        }),
      ).toThrow();
      /*
       * And also warns the user
       */
      expect(warning).toHaveBeenCalled();
    });
    test('Continues if all of the required prop are available', () => {
      expect(() =>
        userInputValidator({
          firstArgument: mockedArgument,
          requiredAll: mockedRequiredProps,
        }),
      ).not.toThrow();
    });
    test('Errors out if one of all required props is not available', () => {
      expect(() =>
        userInputValidator({
          firstArgument: mockedArgument,
          requiredAll: [...mockedRequiredProps, 'anotherRequiredProp'],
        }),
      ).toThrow();
      /*
       * And also warns the user
       */
      expect(warning).toHaveBeenCalled();
    });
    test('It works by default with no arguments passed in', () => {
      expect(() => userInputValidator()).not.toThrow();
    });
  });
});
