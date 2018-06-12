/* @flow */

import ethersProviders from 'ethers/providers';

import type {
  ProviderType,
  AsyncProviderType,
  ProviderArgumentsType,
  ProviderGeneratorType,
  AsyncProviderGeneratorType,
  ProvidersExportType,
} from './flowtypes';

import { warning } from './utils';
import { providers as messages } from './messages';

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
 * @method etherscan
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} token Optional (but recommended) api key to use when connecting
 *
 * All the above params are sent in as props of an {ProviderArgumentsType} object.
 *
 * @return {AsyncProviderType} The provider connection object or an empty one if the connection failed.
 */
export const etherscan = async ({
  network = DEFAULT_NETWORK,
  apiKey,
}: ProviderArgumentsType = {}): AsyncProviderType => {
  let provider: ProviderType = PROVIDER_PROTO;
  try {
    if (apiKey) {
      provider = new ethersProviders.EtherscanProvider(network, apiKey);
      return provider;
    }
    warning(messages.etherscan.apiKey);
    provider = new ethersProviders.EtherscanProvider(network);
  } catch (err) {
    warning(messages.etherscan.connect, network, apiKey, err, {
      level: 'high',
    });
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
 * @param {string} token Optional (but recommended) api key to use when connecting
 *
 * All the above params are sent in as props of an {ProviderArgumentsType} object.
 *
 * @return {AsyncProviderType} The provider connection object or an empty one if the connection failed.
 */
export const infura = async ({
  network = DEFAULT_NETWORK,
  apiKey,
}: ProviderArgumentsType = {}): AsyncProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    if (apiKey) {
      provider = new ethersProviders.InfuraProvider(network, apiKey);
      return provider;
    }
    warning(messages.infura.apiKey);
    provider = new ethersProviders.InfuraProvider(network);
  } catch (err) {
    warning(messages.infura.connect, network, apiKey, err, { level: 'high' });
  }
  return provider;
};

/**
 * Metamask provider generator method.
 * This wraps the `ethers` `Web3Provider` method and provides defaults, error catching and warnings.
 *
 * @TODO Convert to an `async` method
 *
 * @method metamask
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * The above param are sent in as props of an {ProviderArgumentsType} object.
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
export const metamask = async ({
  network = DEFAULT_NETWORK,
}: ProviderArgumentsType = {}): AsyncProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    if (!global.web3 || !global.web3.currentProvider) {
      warning(messages.metamask.notAvailable);
      return provider;
    }
    provider = new ethersProviders.Web3Provider(
      global.web3.currentProvider,
      network,
    );
  } catch (err) {
    warning(messages.metamask.connect, network, err, { level: 'high' });
  }
  return provider;
};

/**
 * Local provider generator method. Useful to connect to a local instance of geth / parity / testrpc.
 * This wraps the `ethers` `JsonRpcProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Convert to an `async` method
 *
 * @method jsonRpc
 *
 * @param {string} url The Json Rpc url of the localhost provider (defaults to `http://localhost:8545`)
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * All the above params are sent in as props of an {ProviderArgumentsType} object.
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
export const jsonRpc = ({
  network = DEFAULT_NETWORK,
  url = `${PROTOCOL}://${HOST}:${PORT}`,
}: ProviderArgumentsType = {}): ProviderType => {
  let provider = PROVIDER_PROTO;
  try {
    /*
     * @TODO Instantly check the connection to see if the provider is up
     *
     * Currently it will create the provider regardless, and only check if it's up when
     * sending a transaction.
     *
     * If we check for it upfront, we can add this provider to the start of the array.
     * To implement this, we need to switch this (and maybe all) provider methods to
     * `async`s, the tradeoff in this case might not be worth it.
     */
    provider = new ethersProviders.JsonRpcProvider(url, network);
  } catch (err) {
    warning(messages.jsonRpc.connect, url, network, err, { level: 'high' });
  }
  return provider;
};

/**
 * Helper method to autoselect from a pre-determined list of providers.
 * It will select the first one that's available.
 *
 * @method autoselect
 *
 * @param {Array} providersList An array of providers to select from. Can be either a provider
 * object (ProviderType) or an provider generator method (ProviderGeneratorType)
 * @return {ProviderType | AsyncProviderGeneratorType} The selected provider connection object
 */
export const autoselect = async (
  providersList: Array<ProviderGeneratorType | AsyncProviderGeneratorType> = [
    metamask,
    etherscan,
    infura,
    jsonRpc,
  ],
): AsyncProviderType => {
  let provider = PROVIDER_PROTO;
  if (!providersList.length) {
    warning(messages.autoselect.empty, { level: 'high' });
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
  warning(messages.autoselect.noProvider, { level: 'high' });
  return provider;
};

const colonyWallet: ProvidersExportType = {
  etherscan,
  infura,
  jsonRpc,
  metamask,
  autoselect,
};

export default colonyWallet;
