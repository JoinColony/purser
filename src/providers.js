/* @flow */

import { providers } from 'ethers';

import { warn, error } from './utils';
import { warnings, errors } from './messages';

import { DEFAULT_NETWORK } from './defaults';

/**
 * Etherscan provider generator method.
 * This wraps the `ethers` `EtherscanProvider` method and provides defaults, error catching and warnings.
 *
 * @method etherscan
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} apiKey Optional (but recommended) api key to use when connecting
 *
 * @return {object} The provider connection object or an empty one if the connection failed.
 */
export const etherscan = (
  network: string = DEFAULT_NETWORK,
  apiKey: string,
) => {
  let provider = {};
  try {
    if (apiKey) {
      provider = new providers.EtherscanProvider(network, apiKey);
    }
    warn(warnings.providers.etherscan.apiKey);
    provider = new providers.EtherscanProvider(network);
  } catch (err) {
    error(errors.providers.etherscan.connect, network, apiKey, err);
  }
  return provider;
};

/**
 * Infura provider generator method.
 * This wraps the `ethers` `InfuraProvider` method and provides defaults, error catching and warnings.
 *
 * @method infura
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} apiKey Optional (but recommended) api key to use when connecting
 *
 * @return {object} The provider connection object or an empty one if the connection failed.
 */
export const infura = (network: string = DEFAULT_NETWORK, apiKey: string) => {
  let provider = {};
  try {
    if (apiKey) {
      provider = new providers.InfuraProvider(network, apiKey);
    }
    warn(warnings.providers.infura.apiKey);
    provider = new providers.InfuraProvider(network);
  } catch (err) {
    error(errors.providers.infura.connect, network, apiKey, err);
  }
  return provider;
};

/**
 * Metamask provider generator method.
 * This wraps the `ethers` `Web3Provider` method and provides defaults, error catching and warnings.
 *
 * @method metamask
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * @return {object} The provider connection object or an empty one if the connection failed.
 */
export const metamask = (network: string = DEFAULT_NETWORK) => {
  let provider = {};
  try {
    if (!global.web3 || !global.web3.currentProvider) {
      warn(warnings.providers.metamask.notAvailable);
      return provider;
    }
    provider = new providers.Web3Provider(global.web3.currentProvider, network);
  } catch (err) {
    error(errors.providers.metamask.connect, network, err);
  }
  return provider;
};

const colonyWallet = {
  etherscan,
  infura,
  metamask,
};

export default colonyWallet;
