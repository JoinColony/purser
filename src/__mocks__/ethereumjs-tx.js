export const EthereumTx = jest.fn().mockImplementation(() => ({
  serialize: () => ({
    toString: () => {},
  }),
}));

export default EthereumTx;
