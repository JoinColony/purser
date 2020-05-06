// TODO: in the future use a minimal implementation for signing rather than web3:
// https://github.com/danfinlay/js-eth-personal-sign-examples
import Web3 from 'web3';

import { warning } from '@purser/core';

import MetaMaskWallet from './MetaMaskWallet';
import {
  methodCaller,
  getInpageProvider,
  detect as detectHelper,
  setStateEventObserver,
} from './helpers';

import { staticMethods as messages } from './messages';

import { MetamaskStateEventsObserverType } from './types';

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
     * We're on the Modern Metamask (after EIP-1102)
     * See: https://eips.ethereum.org/EIPS/eip-1102
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyGlobal: any = global;
    if (anyGlobal.ethereum) {
      /*
       * Inject the web3 provider
       */
      // @TODO let's not do this anymore
      anyGlobal.web3 = new Web3(anyGlobal.ethereum);
      /*
       * Enable it
       */
      [addressAfterEnable] = await anyGlobal.ethereum.enable();
    }
    /*
     * We're on the legacy version of Metamask
     */
    if (!anyGlobal.ethereum && anyGlobal.web3) {
      /*
       * Warn the user about legacy mode
       *
       * @TODO Remove legacy metmask version messages
       * After an adequate amount of time has passed
       */
      warning(messages.legacyMode);
      /*
       * Enable it
       *
       * @NOTE There's an argument to be made here that it's dangerous to use
       * the `getInpageProvider()` helper before using `detect()`
       */
      // @TODO: remove legacy provider at some point
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const legacyProvider = getInpageProvider() as any;
      legacyProvider.enable();
      /*
       * Inject the web3 provider (overwrite the current one)
       */
      anyGlobal.web3 = new Web3(legacyProvider);
    }
    /*
     * Everything functions the same since the Web3 instance is now in place
     * (Granted, it's now using the 1.x.x version)
     */
    return methodCaller(() => {
      const {
        publicConfigStore: { _state: state },
      } = getInpageProvider();
      return new MetaMaskWallet({
        /*
         * The EIP-1102 mode uses the address we got after enabling (and getting
         * the users's permission), while the legacy mode get the address from
         * the state
         */
        address: addressAfterEnable || state.selectedAddress,
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
  callback: MetamaskStateEventsObserverType,
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
