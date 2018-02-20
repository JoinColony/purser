/* @flow */

import { providers } from 'ethers';

const defaultNetwork = 'homestead';

const etherscan = (network: string = defaultNetwork): void => {
  const provider = new providers.EtherscanProvider(network);
  return provider;
};

const infura = (network: string = defaultNetwork): void => {
  const provider = new providers.InfuraProvider(network);
  return provider;
};

const metamask = (network: string = defaultNetwork): void => {
  if (window.web3 && window.web3.currentProvider) {
    return new providers.Web3Provider(window.web3.currentProvider, network);
  }
  return undefined;
};

const colonyWallet = {
  etherscan,
  infura,
  metamask,
};

export default colonyWallet;
