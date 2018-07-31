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

const ledgerMessages = {
  staticMethods,
};

export default ledgerMessages;
