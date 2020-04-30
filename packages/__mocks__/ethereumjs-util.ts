export const hashPersonalMessage = jest.fn((value) => value);

export const ecrecover = jest.fn(() => Buffer.alloc(65));

export const privateToPublic = jest.fn((value) => ({
  toString: (...args): string => value.toString(...args),
}));

export const pubToAddress = jest.fn((buffer) => buffer.toString());
