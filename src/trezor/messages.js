/* @flow */
/* eslint-disable max-len */

export const classMessages: Object = {
  userCancelled: 'User cancelled the account export request (via the Prompt)',
};

export const validators: Object = {
  derivationPath: {
    notString: 'Derivation path is not the correct type (expected a String)',
    notValidParts:
      'Derivation path does not contain the required parts (Purpouse, Coin Id, Account, Change + Index)',
    notValidPurpouse:
      'Derivation path does have the Ethereum reserved Purpouse',
    notValidCoin:
      'Derivation path does have the correct Coin type Id (Main or Test net)',
    notValidAccount: 'Derivation path does have the correct account value/type',
    notValidChangeIndex:
      'Derivation path does have the correct Change value or Account Index',
    genericError: 'Something is wrong with the supplied derivation path:',
  },
};
