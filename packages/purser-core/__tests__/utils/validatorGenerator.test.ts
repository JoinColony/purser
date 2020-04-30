import { validatorGenerator } from '../../src/utils';

const validErrorMessage = 'mocked-valid-error-message';
const invalidErrorMessage = 'mocked-invalid-error-message';
const genericErrorMessage = 'mocked-generic-error-message';

const badAssertionsArray = [
  { expression: true, message: validErrorMessage },
  { expression: false, message: invalidErrorMessage, level: undefined },
  { expression: true, message: validErrorMessage },
];

describe('`Core` Module', () => {
  describe('`validatorGenerator()` util', () => {
    test('Stops execution if one of the assertions fails', () => {
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrow();
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrow(invalidErrorMessage);
    });
    test('Triggers a generic error, if throwing is prevented', () => {
      badAssertionsArray[1].level = 'low';
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrow();
      expect(() =>
        validatorGenerator(badAssertionsArray, genericErrorMessage),
      ).toThrow(genericErrorMessage);
    });
  });
});
