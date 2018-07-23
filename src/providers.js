/* @flow */

import ethersProviders from 'ethers/providers';

import type {
  ProviderType,
  AsyncProviderType,
  ProviderArgumentsType,
  AsyncProviderGeneratorType,
} from './flowtypes';

import { warning } from './utils';
import { providers as messages } from './messages';

import {
  MAIN_NETWORK,
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
  network = MAIN_NETWORK,
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
  network = MAIN_NETWORK,
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
 * @method metamask
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * The above param are sent in as props of an {ProviderArgumentsType} object.
 *
 * @return {AsyncProviderType} The provider connection object or an empty one if the connection failed.
 */
export const metamask = async ({
  network = MAIN_NETWORK,
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
 * @method jsonRpc
 *
 * @param {string} url The Json Rpc url of the localhost provider (defaults to `http://localhost:8545`)
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * All the above params are sent in as props of an {ProviderArgumentsType} object.
 *
 * @return {AsyncProviderType} The provider connection object or an empty one if the connection failed.
 */
export const jsonRpc = async ({
  network = MAIN_NETWORK,
  url = `${PROTOCOL}://${HOST}:${PORT}`,
}: ProviderArgumentsType = {}): AsyncProviderType => {
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
 * @return {AsyncProviderGeneratorType} The selected provider connection object
 */
export const autoselect = async (
  providersList: Array<AsyncProviderGeneratorType> = [
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
      /*
       * While disabling this is considered an anti-pattern, since we won't be
       * able to take advantage of pararellization, it this case it doesn't
       * really matter since we are returning after the first available
       * provider
       */
      /* eslint-disable-next-line no-await-in-loop */
      provider = await providersList[i]();
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

const colonyWallet: {
  etherscan: AsyncProviderGeneratorType,
  infura: AsyncProviderGeneratorType,
  jsonRpc: AsyncProviderGeneratorType,
  metamask: AsyncProviderGeneratorType,
  autoselect: AsyncProviderGeneratorType,
} = {
  etherscan,
  infura,
  jsonRpc,
  metamask,
  autoselect,
};

export default colonyWallet;
