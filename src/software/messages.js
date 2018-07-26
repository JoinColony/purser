/* @flow */
/* eslint-disable max-len */

export const classMessages: Object = {
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

const softwareMessages: Object = {
  classMessages,
};

export default softwareMessages;
