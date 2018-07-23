import { validatorGenerator } from '../../utils';

jest.dontMock('../../utils');

const validErrorMessage = 'mocked-valid-error-message';
const invalidErrorMessage = 'mocked-invalid-error-message';
const genericErrorMessage = 'mocked-generic-error-message';

const badAssertionsArray = [
  { expression: true, message: validErrorMessage },
  { expression: false, message: invalidErrorMessage },
  { expression: true, message: validErrorMessage },
];

describe('`Utils` Core Module', () => {
  describe('`validatorGenerator()` method', () => {
    test('Stops execution if one of the assertions fails', () => {
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrow();
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrowError(invalidErrorMessage);
    });
    test('Triggers a generic error, if throwing is prevented', () => {
      badAssertionsArray[1].level = 'low';
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrow();
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrowError(genericErrorMessage);
    });
  });
});
