/*
 * The mocks folder had to be renamed in order for `jest` to not pick it up as duplicate haste mock file.
 * See:
 * https://github.com/facebook/jest/issues/2070
 */

export const warning = jest.fn();

export const objectToErrorString = jest.fn();

export const getRandomValues = jest.fn(value => value);

export const bigNumber = jest.fn(value => ({
  value,
  toString: () => value,
}));

const utils = {
  warning,
  getRandomValues,
  bigNumber,
};

export default utils;
