import { helpers as messages } from './messages';

import {
  MetaMaskInpageProvider,
  MetamaskStateEventsObserverType,
} from './types';

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
    /*
     * @NOTE This is a temporary failsafe check, since Metmask is running an
     * intermediate version which, while it contains most of the `ethereum`
     * global object, it doesn't contain this helper method
     *
     * @TODO Remove legacy metmask object availability check
     * After an adequate amount of time has passed
     */
    if (
      anyGlobal.ethereum.isUnlocked &&
      !(await anyGlobal.ethereum.isUnlocked())
    ) {
      throw new Error(messages.isLocked);
    }
    /*
     * @NOTE This is a temporary failsafe check, since Metmask is running an
     * intermediate version which, while it contains most of the `ethereum`
     * global object, it doesn't contain this helper method
     *
     * @TODO Remove legacy metmask object availability check
     * After an adequate amount of time has passed
     */
    if (
      anyGlobal.ethereum.isEnabled &&
      !(await anyGlobal.ethereum.isEnabled())
    ) {
      throw new Error(messages.notEnabled);
    }
    /*
     * @NOTE If the `isUnlocked` and the `isEnabled` methods are not available
     * it means we are running the pre-release version of Metamask, just prior
     * to the EIP-1102 update, so we just ignore those checks
     */
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
  observer: MetamaskStateEventsObserverType,
): void => {
  const { ethereum } = anyGlobal;
  const {
    publicConfigStore: { _events: stateEvents },
  }: MetaMaskInpageProvider = ethereum;

  if (ethereum.on) {
    ethereum.on('accountsChanged', observer);
  } else {
    stateEvents.update.push(observer);
  }
};
