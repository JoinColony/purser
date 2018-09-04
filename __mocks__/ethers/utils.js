export const bigNumberify = jest.fn(value => value);

const ethersUtils = {
  bigNumberify,
};

export default ethersUtils;
