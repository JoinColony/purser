export const warn = jest.fn();

export const error = jest.fn();

export const getRandomValues = jest.fn(value => value);

const utils = {
  warn,
  error,
  getRandomValues,
};

export default utils;
