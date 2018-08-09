/* @flow */

import { helpers as messages } from './messages';

import type {
  MetamaskInpageProviderType,
  MetamaskStateEventsObserverType,
} from './flowtypes';

/**
 * Detect the injected web3 instance (Injected by Metamask)
 *
 * @method detect
 *
 * @return {boolean} IF it's imjected it will return true, otherwise it will throw
 */
export const detect = (): boolean => {
  if (!global.web3) {
    throw new Error(messages.notInjected);
  }
  if (
    !global.web3.currentProvider ||
    !global.web3.currentProvider.publicConfigStore
  ) {
    throw new Error(messages.noInpageProvider);
  }
  /* eslint-disable-next-line no-underscore-dangle */
  if (!global.web3.currentProvider.publicConfigStore._state) {
    throw new Error(messages.noProviderState);
  }
  /* eslint-disable-next-line no-underscore-dangle */
  if (!global.web3.currentProvider.publicConfigStore._state.selectedAddress) {
    throw new Error(messages.isLocked);
  }
  return true;
};

/**
 * Helper method that wraps a method passed as an argument and first checks
 * for Metamask's availablity before calling it.
 *
 * This is basically a wrapper, so that we can cut down on code repetition, since
 * this pattern repeats itself every time we try to access the in-page proxy.
 *
 * @method methodCaller
 *
 * @param {Function} callback The method to call, if Metamask is available
 * @param {string} errorMessage Optional error message to show to use
 * (in case Metamask is not available)
 *
 * @return {any} It returns the result of the callback execution
 */
export const methodCaller = (
  callback: () => any,
  errorMessage: string = '',
): any => {
  try {
    /*
     * Detect if the Metamask injected proxy is (still) available
     *
     * We need this little go-around trick to mock just one export of
     * the module, while leaving the rest of the module intact so we can test it
     *
     * See: https://github.com/facebook/jest/issues/936
     */
    /* eslint-disable-next-line no-use-before-define */
    metamaskHelpers.detect();
    return callback();
  } catch (caughtError) {
    throw new Error(
      `${errorMessage}${errorMessage ? ' ' : ''}Error: ${caughtError.message}`,
    );
  }
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
export const getInpageProvider = (): (() => MetamaskInpageProviderType) =>
  methodCaller(() => global.web3.currentProvider);

/**
 * Add a new observer method to Metamask's state update events
 *
 * @TODO Add unit tests
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
  const {
    publicConfigStore: { _events: stateEvents },
  }: () => MetamaskInpageProviderType = getInpageProvider();
  return stateEvents.update.push(observer);
};

/*
 * This default export is only here to help us with testing, otherwise
 * it wound't be needed
 */
const metamaskHelpers: Object = {
  detect,
  methodCaller,
  getInpageProvider,
  setStateEventObserver,
};

export default metamaskHelpers;
