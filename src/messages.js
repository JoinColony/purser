/* eslint-disable flowtype/require-valid-file-annotation */
/* eslint-disable max-len */

export const warnings = {
  providers: {
    etherscan: {
      apiKey:
        "You are using the Etherscan provider without an API key. This may limit the number of requests you're allowed to make. You can generate a new API key here: https://etherscan.io/myapikey",
    },
    infura: {
      apiKey:
        "You are using the Infura provider without an API key. This may limit the number of requests you're allowed to make. You can generate a new API by signing up to the service: https://infura.io/signup",
    },
    metamask: {
      notAvailable:
        'The Metamask in-page provider is not available. Make sure that the Metamask extension is installed and enabled in your browser: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    },
  },
};

export const errors = {
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
  },
};

const messages = {
  warnings,
  errors,
};

export default messages;
