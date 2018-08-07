/* @flow */

import { helpers as messages } from './messages';

import type { MetamaskInpageProviderType } from './flowtypes';

/**
 * Detect the injected web3 instance (Injected by Metamask)
 *
 * @TODO Add unit tests
 *
 * @method detect
 *
 * @return {boolean} IF it's imjected it will return true, otherwise it will throw
 */
export const detect = (): boolean => {
  if (global && global.web3) {
    return true;
  }
  throw new Error(messages.cannotDetect);
};

/**
 * If the Metamask injected instance is available, get the in-page provider
 *
 * @TODO Add unit tests
 *
 * @method getInpageProvider
 *
 * @return {Object} The `MetamaskInpageProvider` object instance
 */
export const getInpageProvider = (): MetamaskInpageProviderType => {
  detect();
  return global.web3.currentProvider;
};
