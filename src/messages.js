/* eslint-disable flowtype/require-valid-file-annotation */
/* eslint-disable max-len */

import { MessagesExportType } from './flowtypes';

export const warnings: Object = {
  providers: {
    etherscan: {
      token:
        "You are using the Etherscan provider without an API key. This may limit the number of requests you're allowed to make. You can generate a new API key here: https://etherscan.io/myapikey",
    },
    infura: {
      token:
        "You are using the Infura provider without an API key. This may limit the number of requests you're allowed to make. You can generate a new API by signing up to the service: https://infura.io/signup",
    },
    metamask: {
      notAvailable:
        'The Metamask in-page provider is not available. Make sure that the Metamask extension is installed and enabled in your browser: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    },
  },
  utils: {
    getRandomValues: {
      nodeCryptoFallback:
        "Your browser doesn't have the `webcrypto` API implemented, falling back to the `cryto` library provided by `node`",
    },
  },
  softwareWallet: {
    Class: {
      noProvider:
        "You did not set a provider. While this is not required for wallet creation, it's highly recommended as it will easier to use later. If you do not need a custom provider, just remove the argument and it will auto-select the first one available.",
      noEntrophy:
        "You did not provide entrophy to help with randomness when generating the wallet. While this can be omitted, it's highly recommended. You could omiy this argument and it will provide it for you automatically",
      noPassword:
        'You did not provide a password for encryption. This can be added at a later stage using the `keystore` property setter',
    },
  },
};

export const errors: Object = {
  providers: {
    etherscan: {
      connect:
        'Etherscan provider failed to connect. Please verify the provided network name (%s) and api key (%s). %s',
    },
    infura: {
      connect:
        'Infura provider failed to connect. Please verify the provided network name (%s) and api key (%s). %s',
    },
    metamask: {
      connect:
        'Metamask provider failed to connect. Please verify the provided network name (%s). %s',
    },
    localhost: {
      connect:
        'Local provider failed to connect. Please verify the provided rpc url (%s) and network name (%s). %s',
    },
    autoselect: {
      empty:
        'The providers array seems to be empty. Please add at least one provider to the selection pool.',
      noProvider:
        'No provider could be selected. This most likely happens when all providers in the selection pool fail to connect. Check the error messages leading up to this.',
    },
  },
  utils: {
    getRandomValues: {
      wrongArgumentType:
        'Expected the argument to be an instance of an Uint8Array typed array.',
      noCryptoLib:
        'Could not find any `crypto` libraries. Cannot proceed further as we cannot generate randomness',
    },
  },
  softwareWallet: {
    Class: {
      create:
        'There was an error in creating the wallet, check the provider (%s) and entropy (%s) arguments. We reverted back and generated a wallet with the only defaults. Be careful when using it. %s',
      noAddress:
        'Could not find an address value (%s) in the wallet object. If you see this, the library has already crashed.',
      noPrivateKey:
        'Could not find a private key value (%s) in the wallet object. If you see this, the library has already crashed.',
    },
    openWithPrivateKey: {
      cannotOpenWallet:
        'There was a problem opening your wallet. Check the if the private key (%s) or the provider (%s) are valid. %s',
    },
  },
};

const messages: MessagesExportType = {
  warnings,
  errors,
};

export default messages;
