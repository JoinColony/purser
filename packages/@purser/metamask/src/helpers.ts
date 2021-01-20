import { helpers as messages } from './messages';

import { AccountsChangedCallback } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyGlobal: any = global;
/*
 * @TODO Add isModern() helper method to detect the new version of Metamask
 */

/**
 * Detect the Metmask Extensaion
 *
 * @method detect
 *
 * @return {boolean} If it's available it will return true, otherwise it will throw
 */
export const detect = async (): Promise<boolean> => {
  /*
   * Modern Metamask Version
   */
  if (anyGlobal.ethereum) {
    const { ethereum } = anyGlobal;
    /*
     * Check that the provider is connected to the chain
     */
    if (!ethereum.isConnected()) {
      throw new Error(messages.noProvider);
    }
    /*
     * Check if the account is unlocked
     *
     * @NOTE we just assume the required methods exist on the metamask provider
     * otherwise we'll get right back to "support legacy metamask hell"
     */
    // eslint-disable-next-line no-underscore-dangle
    if (!(await ethereum._metamask.isUnlocked())) {
      throw new Error(messages.isLocked);
    }
    /*
     * If we don't have the `eth_accounts` permissions it means that we don't have
     * account access
     */
    const permissions = await ethereum.request({
      method: 'wallet_getPermissions',
    });
    if (
      !permissions.length ||
      !permissions[0] ||
      permissions[0].parentCapability !== 'eth_accounts'
    ) {
      throw new Error(messages.notConnected);
    }
    return true;
  }
  throw new Error(messages.noExtension);
};

/**
 * Helper method that wraps a method passed as an argument and first checks
 * for Metamask's availablity before calling it.
 *
 * This is basically a wrapper, so that we can cut down on code repetition, since
 * this pattern repeats itself every time we try to access the in-page proxy.
 *
 *
 * We must check for the Metamask injected in-page proxy every time we
 * try to access it. This is because something can change it from the time
 * of last detection until now.
 *
 * @method methodCaller
 *
 * @param {Function} callback The method to call, if Metamask is available
 * @param {string} errorMessage Optional error message to show to use
 * (in case Metamask is not available)
 *
 * @return {any} It returns the result of the callback execution
 */
export const methodCaller = async <T>(
  callback: () => T,
  errorMessage = '',
): Promise<T> => {
  try {
    await detect();
    return callback();
  } catch (caughtError) {
    throw new Error(
      `${errorMessage}${errorMessage ? ' ' : ''}Error: ${caughtError.message}`,
    );
  }
};

/**
 * Add a new observer method to Metamask's state update events
 *
 * @method setStateEventObserver
 *
 * @param {Function} observer Function to add the state events update array
 *
 * @return {number} the length of the state events update array
 */
export const setStateEventObserver = (
  callback: AccountsChangedCallback,
): void => {
  const { ethereum } = anyGlobal;
  ethereum.on('accountsChanged', callback);
};
