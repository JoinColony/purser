const throwErrorNetwork = network => {
  if (network === 'error') {
    throw new Error();
  }
};

export const EtherscanProvider = jest
  .fn()
  .mockImplementation(network => throwErrorNetwork(network));

export const InfuraProvider = jest
  .fn()
  .mockImplementation(network => throwErrorNetwork(network));

export const JsonRpcProvider = jest
  .fn()
  .mockImplementation((url, network) => throwErrorNetwork(network));

export const Web3Provider = jest
  .fn()
  .mockImplementation((web3, network) => throwErrorNetwork(network));

const providers = {
  EtherscanProvider,
  InfuraProvider,
  JsonRpcProvider,
  Web3Provider,
};

export default providers;
