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
};

export default utils;
