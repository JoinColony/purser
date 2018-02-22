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
  let provider;
  try {
    if (apiKey) {
      provider = new providers.EtherscanProvider(network, apiKey);
      return provider;
    }
    warn(warnings.providers.etherscan.apiKey);
    provider = new providers.EtherscanProvider(network);
    return provider;
  } catch (err) {
    error(errors.providers.etherscan.connect, network, apiKey, err);
  }
  return {};
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
  let provider;
  try {
    if (apiKey) {
      provider = new providers.InfuraProvider(network, apiKey);
      return provider;
    }
    warn(warnings.providers.infura.apiKey);
    provider = new providers.InfuraProvider(network);
    return provider;
  } catch (err) {
    error(errors.providers.infura.connect, network, apiKey, err);
  }
  return {};
};

const colonyWallet = {
  etherscan,
  infura,
};

export default colonyWallet;
