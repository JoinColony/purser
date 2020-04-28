export const hashPersonalMessage = jest.fn((value) => value);

export const ecrecover = jest.fn(() => Buffer.alloc(65));

export const privateToPublic = jest.fn((value) => ({
  toString: (): string => value,
}));

export const pubToAddress = jest.fn((buffer) => buffer.toString());
