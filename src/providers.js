/* @flow */

import ethersProviders from 'ethers/providers';

import type {
  ProviderType,
  ProviderGeneratorType,
  ProvidersExportType,
} from './flowtypes';

import { warn, error } from './utils';
import { warnings, errors } from './messages';

import {
  DEFAULT_NETWORK,
  LOCALPROVIDER_PROTOCOL as PROTOCOL,
  LOCALPROVIDER_HOST as HOST,
  LOCALPROVIDER_PORT as PORT,
  PROVIDER_PROTO,
} from './defaults';

/**
 * Etherscan provider generator method.
 * This wraps the `ethers` `EtherscanProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method etherscan
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} token Optional (but recommended) api key to use when connecting
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
export const etherscan = (
  network: string = DEFAULT_NETWORK,
  token: string,
): ProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    if (token) {
      provider = new ethersProviders.EtherscanProvider(network, token);
      return provider;
    }
    warn(warnings.providers.etherscan.token);
    provider = new ethersProviders.EtherscanProvider(network);
  } catch (err) {
    error(errors.providers.etherscan.connect, network, token, err);
  }
  return provider;
};

/**
 * Infura provider generator method.
 * This wraps the `ethers` `InfuraProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method infura
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} token Optional (but recommended) api key to use when connecting
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
export const infura = (
  network: string = DEFAULT_NETWORK,
  token: string,
): ProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    if (token) {
      provider = new ethersProviders.InfuraProvider(network, token);
      return provider;
    }
    warn(warnings.providers.infura.token);
    provider = new ethersProviders.InfuraProvider(network);
  } catch (err) {
    error(errors.providers.infura.connect, network, token, err);
  }
  return provider;
};

/**
 * Metamask provider generator method.
 * This wraps the `ethers` `Web3Provider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method metamask
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
export const metamask = (network: string = DEFAULT_NETWORK): ProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    if (!global.web3 || !global.web3.currentProvider) {
      warn(warnings.providers.metamask.notAvailable);
      return provider;
    }
    provider = new ethersProviders.Web3Provider(
      global.web3.currentProvider,
      network,
    );
  } catch (err) {
    error(errors.providers.metamask.connect, network, err);
  }
  return provider;
};

/**
 * Local provider generator method. Useful to connect to a local instance of geth / parity / testrpc.
 * This wraps the `ethers` `JsonRpcProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method localhost
 *
 * @param {string} url The Json Rpc url of the localhost provider (defaults to `http://localhost:8545`)
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
export const localhost = (
  url: string = `${PROTOCOL}://${HOST}:${PORT}`,
  network: string = DEFAULT_NETWORK,
): ProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    /*
     * @TODO Instantly check the connection to see if the provider is up
     * Currently it will create the provider regardless, and only check if it's up when
     * sending a transaction.
     * If we check for it upfront, we can add this provider to the start of the array.
     * To implement this, we need to switch this (and maybe all) provider methods to
     * `async`s, the tradeoff in this case might not be worth it.
     */
    provider = new ethersProviders.JsonRpcProvider(url, network);
  } catch (err) {
    error(errors.providers.localhost.connect, url, network, err);
  }
  return provider;
};

/**
 * Helper method to autoselect from a pre-determined list of providers.
 * It will select the first one that's available.
 *
 * @TODO Convert to an `async` method
 *
 * @method autoselect
 *
 * @param {Array} providersList An array of providers to select from. Can be either a provider
 * object (ProviderType) or an provider generator method (ProviderGeneratorType)
 * @return {ProviderType} The selected provider connection object
 */
export const autoselect = (
  providersList: Array<ProviderGeneratorType> = [
    metamask,
    etherscan,
    infura,
    localhost,
  ],
) => {
  let provider = PROVIDER_PROTO;
  if (!providersList.length) {
    error(errors.providers.autoselect.empty);
    return provider;
  }
  for (let i = 0, l = providersList.length; i < l; i += 1) {
    if (typeof providersList[i] === 'object' && providersList[i].chainId) {
      provider = providersList[i];
      return provider;
    }
    if (typeof providersList[i] === 'function') {
      provider = providersList[i]();
      if (provider && provider.chainId) {
        return provider;
      }
      /*
       * Reset the provider back to an empty object if it wasn't the right format
       */
      provider = PROVIDER_PROTO;
    }
  }
  error(errors.providers.autoselect.noProvider);
  return provider;
};

const colonyWallet: ProvidersExportType = {
  etherscan,
  infura,
  localhost,
  metamask,
  autoselect,
};

export default colonyWallet;
