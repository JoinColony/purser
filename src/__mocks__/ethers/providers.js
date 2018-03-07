export const providerMock = jest.fn().mockImplementation(network => {
  if (network === 'error') {
    throw new Error();
  }
});

export const EtherscanProvider = providerMock;

export const InfuraProvider = providerMock;

export const JsonRpcProvider = providerMock;

export const Web3Provider = jest.fn().mockImplementation((web3, network) => {
  if (network === 'error') {
    throw new Error();
  }
});

const providers = {
  EtherscanProvider,
  InfuraProvider,
  JsonRpcProvider,
  Web3Provider,
};

export default providers;
