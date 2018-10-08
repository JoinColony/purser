export const bigNumberify = jest.fn(value => value);

export const computeAddress = jest.fn(buffer => buffer.toString());

export const verifyMessage = jest.fn((message, signature) => {
  if (!message || !signature) {
    throw new Error();
  }
  return 'mocked-recovered-address';
});

const ethersUtils = {
  bigNumberify,
  computeAddress,
};

export default ethersUtils;
