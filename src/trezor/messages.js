/* @flow */
/* eslint-disable max-len */

export const classMessages: Object = {
  userExportCancel:
    'User cancelled the account export request (via Window prompt)',
  userSignTxCancel:
    'User cancelled signing the transaction (via Hardware buttons)',
};

export const validators: Object = {
  derivationPath: {
    notString: 'Derivation path is not the correct type (expected a String)',
    notValidParts:
      'Derivation path does not contain the required parts (Purpouse, Coin Id, Account, Change + Index)',
    notValidHeaderKey:
      'Derivation path does not start with the correct header key',
    notValidPurpouse:
      'Derivation path does have the Ethereum reserved Purpouse',
    notValidCoin:
      'Derivation path does have the correct Coin type Id (Main or Test net)',
    notValidAccount: 'Derivation path does have the correct account value/type',
    notValidChangeIndex:
      'Derivation path does have the correct Change value or Account Index',
    notValidAccountIndex:
      'Derivation path should have only one value for the Account Index',
    genericError: 'Something is wrong with the supplied derivation path:',
  },
  safeInteger: {
    notNumber: 'The value passed in as an argument is not a number',
    notPositive: 'The integer value passed in as an argument is not positive',
    notSafe:
      'The integer value passed in as an argument outside the safe range',
    genericError: 'Something is wrong with the supplied integer',
  },
};
