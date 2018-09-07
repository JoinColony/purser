/* @flow */

import MetamaskWallet from './class';
import {
  methodCaller,
  getInpageProvider,
  detect as detectHelper,
} from './helpers';

import { staticMethods as messages } from './messages';

import type { MetamaskInpageProviderType } from './flowtypes';

const metamaskWallet: Object = {
  /**
   * Open the Metamask Wallet instance
   *
   * @method open
   *
   * @return {WalletType} The wallet object resulted by instantiating the class
   * (Object is wrapped in a promise).
   */
  open: async (): Promise<MetamaskWallet> =>
    methodCaller(() => {
      const {
        publicConfigStore: { _state: state },
      }: () => MetamaskInpageProviderType = getInpageProvider();
      return new MetamaskWallet({
        address: state.selectedAddress,
      });
    }, messages.metamaskNotAvailable),
  /**
   * Check if Metamask's injected web3 proxy instance is available in the
   * global object.
   *
   * Makes use of the `detect()` helper, basically it's a wrapper
   * that exposes it from the module.
   *
   * @method detect
   *
   * @return {boolean} Only returns true if it's available, otherwise it will throw.
   */
  detect: async (): Promise<boolean> => detectHelper(),
};

export default metamaskWallet;
