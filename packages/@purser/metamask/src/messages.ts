/* eslint-disable max-len */

export const staticMethods = {
  metamaskNotAvailable:
    "Metamask extension could not be accessed. Please ensure that it is enabled and it's not locked",
  cannotSendTransaction:
    'Cannot send the transaction. Make sure the Metamask extension is available',
  cancelMessageSign: 'User cancelled signing the message (via Metamask UI)',
  cancelTransactionSign:
    'User cancelled signing the transaction (via Metamask UI)',
  dontSetNonce:
    "Metamask automatically sets the nonce value for you. Unless you want to manually overwrite a pending transaction, it's best you don't set one",
  cannotSignMessage:
    'Cannot sign the message. Make sure the Metamask extension is available',
  didNotAuthorize:
    'The user did not authorize opening of the Metamask account (via Metamask UI)',
  signMessageArgumentMissing:
    'signMessage({}) function requires on object typed argument.',
  /*
   * Legacy Metamask Version
   *
   * @TODO Remove legacy metmask version messages
   * After an adequate amount of time has passed
   */
  legacyMode:
    "Metamask is running in legacy mode. While this is still going to work, it will be disabled in the future, and it's recommended you upgrade the extension. See this for more details: https://bit.ly/2QQHXvF",
  cannotAddHook:
    "Cannot add an Account Change Hook to the injected Metamask Instance. This should have been caught by the 'detect()' method. Since it didn't it means some API's might have changed.",
};

export const helpers = {
  noExtension:
    "Could not detect the Metamask extension. Ensure that it's enabled",
  isLocked: "Metamask's instance is locked. Please unlock it from the UI",
  notEnabled:
    'The Metmask extension instance has not been enabled on this page. Please use the `open()` method to do so.',
  /*
   * Legacy Metamask Version
   *
   * @TODO Remove legacy metmask version messages
   * After an adequate amount of time has passed
   */
  noInpageProvider:
    'Could not detect the Metamask in-page provider. Ensure something is not tampering with the web3 Proxy instance',
  noProviderState:
    "Metamask's in-page provider does not contain the state. Ensure something is not tampering with the web3 Proxy instance",
};

export const validators = {
  noState:
    'The state object does not exist. Check the injected Metamask in-page provider',
  noStateAddress:
    'The state object is not a valid Metamask format. It does not contain the address prop',
  noStateNetwork:
    'The state object is not a valid Metamask format. It does not contain the chain id',
};

export const MetamaskWallet = {
  cannotObserve:
    'Cannot listen for Metamask changes. Make sure the Metamask extension is available',
  cannotGetPublicKey:
    'Could not sign the message to recover the public key from. Make sure the Metamask extension is available',
};
