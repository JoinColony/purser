/* @flow */
/* eslint-disable max-len */

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
  messageSignatureOnlyTrezor:
    'Please take note: The message signature produced by a trezor wallet can only be verified using that trezor wallet (verifyMessage method)',
};

const trezorMessages = {
  staticMethodsMessages,
};

export default trezorMessages;
