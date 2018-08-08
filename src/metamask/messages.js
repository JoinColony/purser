/* @flow */
/* eslint-disable max-len */

export const staticMethods: Object = {
  metamaskNotAvailable:
    "Metamask extension could not be accessed. Please ensure that it is enabled and it's not locked",
};

export const helpers: Object = {
  notInjected: 'Could not detect the Metamask injected web3 Proxy instance',
  noInpageProvider:
    'Could not detect the Metamask in-page provider. Ensure something is not tampering with the web3 Proxy instance',
  noProviderState:
    "Metamask's in-page provider does not contain the state. Ensure something is not tampering with the web3 Proxy instance",
  isLocked: "Metamask's instance is locked. Please unlock it from the UI",
};
