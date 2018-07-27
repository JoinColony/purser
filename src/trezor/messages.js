/* @flow */
/* eslint-disable max-len */

export const classMessages: Object = {
  addressIndexOutsideRange:
    'The address index you provided is outside the address count range you derived when opening the wallet',
};

export const staticMethodsMessages: Object = {
  userExportCancel:
    'User cancelled the account export request (via Window prompt)',
  userExportGenericError:
    'Could not export the wallet account, check the values you are sending to the Trezor service',
  userSignTxCancel:
    'User cancelled signing the transaction (via Hardware buttons)',
  userSignTxGenericError:
    'Could not sign the transaction, check the values you are sending to the Trezor service',
  messageSignatureInvalid: 'The message signature is invalid',
};
