/* @flow */

import { providers } from 'ethers';

const colonyWallet = {
  etherscan: (network: string = 'homested'): void =>
    new providers.EtherscanProvider(network),
  infura: (network: string = 'homested'): void =>
    new providers.InfuraProvider(network),
  metamask: (network: string = 'homested'): void => {
    if (window.web3 && window.web3.currentProvider) {
      return new providers.Web3Provider(window.web3.currentProvider, network);
    }
    return undefined;
  },
};

export default colonyWallet;
