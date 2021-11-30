import { hexlify, hexStripZeros } from 'ethers/utils';

import { helpers as messages } from './messages';

import {
  AccountsChangedCallback,
  ObservableEvents,
  MetamaskEthereumGlobal,
  EthereumRequestMethods,
  EthereumChain,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyGlobal: any = global;

/**
 * Manually detect Metamaks's Lock State
 *
 * We need to do this check manually isnce we can't always rely on metmask `isUnlocked` experimental
 * method:
 * https://docs.metamask.io/guide/ethereum-provider.html#experimental-api
 * It will not refresh it's state after a wallet unlock, only after a page refresh
 *
 * To make this work we also check the accounts that metamask gives us. If it's locked
 * it will just give us back an empty array which we can inferr from that wallet is locked
 *
 * @method isExtensionLocked
 *
 * @param {MetamaskEthereumGlobal} ethereum The global Ethereum provider injected by Metamask
 *
 * @returns {boolean} state of the lock on the metamask wallet
 */
const isExtensionLocked = async (
  ethereum: MetamaskEthereumGlobal,
): Promise<boolean> => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    if (await ethereum._metamask.isUnlocked()) {
      return true;
    }
    const accounts: Array<string> = await ethereum.request({
      method: EthereumRequestMethods.Accounts,
    });
    return !!accounts?.length;
  } catch (error) {
    return false;
  }
};

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
    const { ethereum }: { ethereum: MetamaskEthereumGlobal } = anyGlobal;
    /*
     * Check that the provider is connected to the chain
     */
    if (!ethereum.isConnected()) {
      throw new Error(messages.noProvider);
    }
    /*
     * Check if the account is unlocked
     */
    if (!(await isExtensionLocked(ethereum))) {
      throw new Error(messages.isLocked);
    }
    /*
     * If we don't have the `eth_accounts` permissions it means that we don't have
     * account access
     */
    const permissions: Array<{
      parentCapability?: string;
    }> = await ethereum.request({
      method: EthereumRequestMethods.WalletPermissions,
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
  observableEvent: ObservableEvents = 'accountsChanged',
): void => {
  const { ethereum } = anyGlobal;
  ethereum.on(observableEvent, callback);
};

export const switchChain = async (chainId: number): Promise<void> => {
  const { ethereum } = anyGlobal;
  return ethereum.request({
    method: EthereumRequestMethods.SwitchChain,
    /*
     * @NOTE Need to also strip zeros since `hexlify` returns a signed hex string
     * which is not something Metamask likes as a chain Id
     */
    params: [{ chainId: hexStripZeros(hexlify(chainId)) }],
  });
};

export const addChain = async (chainDetails: EthereumChain): Promise<void> => {
  const { ethereum } = anyGlobal;
  const {
    chainId,
    chainName,
    nativeCurrency = {},
    rpcUrls,
    blockExplorerUrls,
  } = chainDetails;
  return ethereum.request({
    method: EthereumRequestMethods.AddNewChain,
    params: [
      {
        /*
         * @NOTE Need to also strip zeros since `hexlify` returns a signed hex string
         * which is not something Metamask likes as a chain Id
         */
        chainId: hexStripZeros(hexlify(chainId)),
        chainName,
        nativeCurrency: {
          decimals: 18,
          ...nativeCurrency,
        },
        rpcUrls,
        blockExplorerUrls,
      },
    ],
  });
};
