export const bigNumberify = jest.fn((value) => value);

export const poll = jest.fn(() => '');

export const verifyMessage = jest.fn((message, signature) => {
  if (!message || !signature) {
    throw new Error();
  }
  return 'mocked-recovered-address';
});
