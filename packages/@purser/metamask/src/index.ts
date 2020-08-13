import { PurserWallet } from '@purser/core';

import MetaMaskWallet from './MetaMaskWallet';
import {
  methodCaller,
  detect as detectHelper,
  setStateEventObserver,
} from './helpers';

import { staticMethods } from './messages';

import { AccountsChangedCallback } from './types';

// Export some helpful types and utils
export type { MetaMaskWallet, PurserWallet };

export const messages = staticMethods;

/**
 * Open the Metamask Wallet instance
 *
 * @method open
 *
 * @return {WalletType} The wallet object resulted by instantiating the class
 * (Object is wrapped in a promise).
 */
export const open = async (): Promise<MetaMaskWallet> => {
  let addressAfterEnable: string;
  try {
    /*
     * See: https://eips.ethereum.org/EIPS/eip-1102
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyGlobal: any = global;
    if (anyGlobal.ethereum) {
      [addressAfterEnable] = await anyGlobal.ethereum.enable();
    }
    return methodCaller(() => {
      return new MetaMaskWallet({
        /*
         * The EIP-1102 mode uses the address we got after enabling (and getting
         * the users's permission)
         */
        address: addressAfterEnable,
      });
    }, messages.metamaskNotAvailable);
  } catch (caughtError) {
    /*
     * User did not authorize us to open his account. We cannot do anything else.
     * (By clicking the 'Reject' button on the API request popup)
     */
    throw new Error(messages.didNotAuthorize);
  }
};

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
export const detect = async (): Promise<boolean> => detectHelper();

/**
 * Hook into Metamask's state events observers array to be able to act on account
 * changes from the UI
 *
 * It's a wrapper around the `setStateEventObserver()` helper method
 *
 * @method accountChangeHook
 *
 * @param {Function} callback Function to add the state events update array
 * It receives the state object as an only argument
 *
 * @return {Promise<void>} Does not return noting
 */
export const accountChangeHook = async (
  callback: AccountsChangedCallback,
): Promise<void> => {
  /*
   * If detect fails, it will throw, with a message explaining the problem
   * (Most likely Metamask will be locked, so we won't be able to get to
   * the state observer via the in-page provider)
   */
  detectHelper();
  try {
    return setStateEventObserver(callback);
  } catch (error) {
    /*
     * If this throws/catches here it means something very weird is going on.
     * `detect()` should catch anything that're directly related to Metamask's functionality,
     * but if that passes and we have to catch it here, it means some underlying APIs
     * might have changed, and this will be very hard to debug
     */
    throw new Error(messages.cannotAddHook);
  }
};
