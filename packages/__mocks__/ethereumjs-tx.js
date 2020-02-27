export const Transaction = jest.fn().mockImplementation(() => ({
  serialize: () => ({
    toString: () => 'mocked-serialized-signed-transaction',
  }),
}));

const EthereumJsTx = jest.fn(() => ({ Transaction }));

export default EthereumJsTx;
