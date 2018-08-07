/* @flow */

import { detect } from './helpers';

import { staticMethods as messages } from './messages';

const metamaskWallet: Object = {
  /**
   * Open the Metamask Wallet instance
   *
   * @method open
   *
   * @return {[type]} [description]
   */
  open: () => {
    try {
      detect();
    } catch (caughtError) {
      throw new Error(
        `${messages.metamaskNotAvailable}. Error: ${caughtError.message}`,
      );
    }
  },
};

export default metamaskWallet;
