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

export const utils: Object = {
  getRandomValues: {
    nodeCryptoFallback:
      "Your browser doesn't have the `webcrypto` API implemented, falling back to the `cryto` library provided by `node`",
    wrongArgumentType:
      'Expected the argument to be an instance of an Uint8Array typed array.',
    noCryptoLib:
      'Could not find any `crypto` libraries. Cannot proceed further as we cannot generate randomness',
  },
};

export const softwareWallet: Object = {
  noProvider:
    "You did not set a provider. While this is not required for wallet creation, it's highly recommended as it will easier to use later. If you do not need a custom provider, just remove the argument and it will auto-select the first one available.",
  noEntrophy:
    "You did not provide entrophy to help with randomness when generating the wallet. While this can be omitted, it's highly recommended. You could omiy this argument and it will provide it for you automatically",
  noPassword:
    'You did not provide a password for encryption. This can be added at a later stage using the `keystore` property setter',
  create:
    'There was an error in creating the wallet, check the provider (%s) and entropy (%s) arguments. We reverted back and generated a wallet with the only defaults. Be careful when using it. %s',
  noAddress:
    'Could not find an address value (%s) in the wallet object. If you see this, the library has already crashed.',
  noPrivateKey:
    'Could not find a private key value (%s) in the wallet object. If you see this, the library has already crashed.',
  open:
    'Could not open the wallet with the method you provided. Please check the arguments you passed in: %s %s',
  transactionData:
    'The transaction data you provided is not in the correct Object format (%s). If the transaction is already signed, make sure you parse it first: https://docs.ethers.io/ethers.js/html/api-wallet.html#parsing-transactions',
  transactionConfirmationFail:
    'The confirmation for this transaction (%s) was rejected. The transaction was not sent.',
};

const messages: { providers: Object, utils: Object, softwareWallet: Object } = {
  providers,
  utils,
  softwareWallet,
};

export default messages;
