export const HDKey = jest.fn().mockImplementation(() => ({
  publicKey: '',
  chainCode: '',
  deriveChild: jest.fn(index => ({
    publicKey: Buffer.from(`mocked-private-key-${index}`),
  })),
}));

export default HDKey;
