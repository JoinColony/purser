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
  /*
   * @TODO Generalized warning/error messages
   *
   * This is exactly the same as the software providersDeprecated warning.
   * So when this will all be split up into multiple components (wallets-core,
   * wallets-software, wallets-treozor, etc...) this should go into the core
   * component as it is shared between all of them/
   */
  providersDeprecated:
    'Use of providers with this library is deprecated. In the upcoming releases we will not use them internally at all, as this functionality will be offloaded to the end user.',
};
