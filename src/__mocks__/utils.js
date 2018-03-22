export const warning = jest.fn();

export const getRandomValues = jest.fn(value => value);

const utils = {
  warning,
  getRandomValues,
};

export default utils;
