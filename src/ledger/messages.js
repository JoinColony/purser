/* @flow */
/* eslint-disable max-len */

export const staticMethods: Object = {
  userExportGenericError:
    'Could not export the wallet account, check the values you are sending to your Ledger Wallet',
  userSignTxGenericError:
    'Could not sign the transaction, check the values you are sending to your Ledger Wallet',
  userSignInteractionWarning:
    'We need your confirmation before we can sign the transaction. Check your Ledger Wallet!',
};

const ledgerMessages = {
  staticMethods,
};

export default ledgerMessages;
