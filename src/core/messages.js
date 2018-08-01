/* @flow */
/* eslint-disable max-len */

export const validators: Object = {
  derivationPath: {
    notString: 'Derivation path is not the correct type (expected a String)',
    notValidParts:
      'Derivation path does not contain the required parts (Purpouse, Coin Id, Account, Change + Index)',
    notValidHeaderKey:
      'Derivation path does not start with the correct header key',
    notValidPurpouse:
      'Derivation path does not have the Ethereum reserved Purpouse',
    notValidCoin:
      'Derivation path does not have the correct Coin type Id (Main or Test net)',
    notValidAccount:
      'Derivation path does not have the correct account value/type',
    notValidChangeIndex:
      'Derivation path does not have the correct Change value or Account Index',
    notValidAccountIndex:
      'Derivation path should have only one value for the Account Index',
    genericError: 'Something is wrong with the supplied derivation path',
  },
  safeInteger: {
    notNumber: 'The value passed in as an argument is not a number',
    notPositive: 'The integer value passed in as an argument is not positive',
    notSafe:
      'The integer value passed in as an argument outside the safe range',
    genericError: 'Something is wrong with the supplied integer',
  },
  bigNumber: {
    notBigNumber: 'The value passed in is not a Big Number',
    genericError: 'Something is wrong with the supplied Big Number value',
  },
  address: {
    notStringSequence: 'The address passed in is not a valid String',
    notLength: 'The address passed in does not have the correct length',
    notFormat: 'The address passed in is not in the correct format',
    genericError: 'Something is wrong with the supplied address',
  },
  hexSequence: {
    notStringSequence: 'The hex sequence passed in is not a valid String',
    notFormat: 'The hex sequence passed in is not in a correct hex format',
    tooBig:
      'The hex sequence passed in is too big in size. It should be up to 1024 Bytes',
    genericError: 'Something is wrong with the supplied hex sequence',
  },
  message: {
    notString: 'The string passed in is not a valid String type',
    tooBig:
      'The string passed in is too big in size. It should be up to 1024 Bytes',
    genericError: 'Something is wrong with the supplied string',
  },
};

export const utils: Object = {
  getRandomValues: {
    nodeCryptoFallback:
      "Your browser doesn't have the `webcrypto` API implemented, falling back to the `cryto` library provided by `node`",
    wrongArgumentType:
      'Expected the argument to be an instance of an Uint8Array typed array',
    noCryptoLib:
      "Could not find any `crypto` libraries. We'll try our best to still provide randomness, but it's not all that good, since it relies on Javascript's internal random number generator",
  },
};

export const genericClass: Object = {
  addressIndexOutsideRange:
    'The address index you provided is outside the address count range you derived when opening the wallet',
};

export const deprecated: Object = {
  providers:
    'Use of providers with this library is deprecated. In the upcoming releases we will not use them internally at all, as this functionality will be offloaded to the end user',
};

export const helpers: Object = {
  verifyMessageSignature: {
    wrongLength:
      "The provided signature's buffer has the wrong length. Most likely your initial signature is also the wrong length. Expected 64 bits",
    somethingWentWrong:
      'Something went wrong while trying to recover the `publicKey` from your signature',
  },
};
