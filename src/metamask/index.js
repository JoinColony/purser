/* @flow */

import MetamaskWallet from './class';
import { methodCaller, getInpageProvider } from './helpers';

import { staticMethods as messages } from './messages';

import type { MetamaskInpageProviderType } from './flowtypes';

const metamaskWallet: Object = {
  /**
   * Open the Metamask Wallet instance
   *
   * @TODO Add unit tests
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
};

export default metamaskWallet;
