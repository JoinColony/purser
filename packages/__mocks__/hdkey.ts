export const HDKey = jest.fn().mockImplementation(() => ({
  publicKey: '',
  chainCode: '',
  deriveChild: jest.fn(index => ({
    publicKey: Buffer.from(`mocked-hex-address-${index}`),
  })),
}));

export default HDKey;
