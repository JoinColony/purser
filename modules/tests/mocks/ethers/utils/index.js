export const bigNumberify = jest.fn(value => value);

export const computeAddress = jest.fn(buffer => buffer.toString());

const ethersUtils = {
  bigNumberify,
  computeAddress,
};

export default ethersUtils;
