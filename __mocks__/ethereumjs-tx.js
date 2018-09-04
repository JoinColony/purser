export const EthereumTx = jest.fn().mockImplementation(() => ({
  serialize: () => ({
    toString: () => 'mocked-hex-string',
  }),
}));

export default EthereumTx;
