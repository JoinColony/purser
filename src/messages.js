/* @flow */
/* eslint-disable max-len */

export const providers: Object = {
  etherscan: {
    apiKey:
      "You are using the Etherscan provider without an API key. This may limit the number of requests you're allowed to make. You can generate a new API key here: https://etherscan.io/myapikey",
    connect:
      'Etherscan provider failed to connect. Please verify the provided network name (%s) and api key (%s). %s',
  },
  infura: {
    apiKey:
      "You are using the Infura provider without an API key. This may limit the number of requests you're allowed to make. You can generate a new API by signing up to the service: https://infura.io/signup",
    connect:
      'Infura provider failed to connect. Please verify the provided network name (%s) and api key (%s). %s',
  },
  metamask: {
    notAvailable:
      'The Metamask in-page provider is not available. Make sure that the Metamask extension is installed and enabled in your browser: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    connect:
      'Metamask provider failed to connect. Please verify the provided network name (%s). %s',
  },
  jsonRpc: {
    connect:
      'Local provider failed to connect. Please verify the provided rpc url (%s) and network name (%s). %s',
  },
  autoselect: {
    empty:
      'The providers array seems to be empty. Please add at least one provider to the selection pool.',
    noProvider:
      'No provider could be selected. This most likely happens when all providers in the selection pool fail to connect. Check the error messages leading up to this.',
  },
};

const messages: Object = {
  providers,
};

export default messages;
