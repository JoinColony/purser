/* @flow */
/* eslint-disable max-len */

export const staticMethods: Object = {
  userExportGenericError:
    'Could not export the wallet account, check the values you are sending to your Ledger Wallet',
  userSignTxGenericError:
    'Could not sign the transaction, check the values you are sending to your Ledger Wallet',
  /*
   * @TODO Refactor both messages into a generic one?
   */
  userSignInteractionWarning:
    'We need your confirmation before we can sign the transaction. Check your Ledger Wallet!',
  userSignMessageInteractionWarning:
    'We need your confirmation before we can sign the message. Check your Ledger Wallet!',
};

export const transportErrors: Object = {
  notSupported:
    'Your browser does not support the U2F transport protocol (required by your Ledger device)',
  notSecure:
    'The U2F transport protocol (required by your Ledger device) only works across a secure browser connection (https)',
  timeout:
    "Your Ledger device is either locked or you didn't enter the Ethereum app. Either unlock it or enter the app, then you can try again.",
};
