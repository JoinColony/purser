/* @flow */

import { helpers as messages } from './messages';

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

const metamaskHelpers: Object = {
  detect,
};

export default metamaskHelpers;
