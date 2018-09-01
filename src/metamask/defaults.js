/* @flow */

export const PUBLICKEY_RECOVERY_MESSAGE: string =
  'By signing this message you are allowing access to your public key';

export const STD_ERRORS: Object = {
  CANCEL_MSG_SIGN: 'User denied message signature',
  CANCEL_TX_SIGN: 'User denied transaction signature',
};

/*
 * Prop names used to validate user input against
 */
export const REQUIRED_PROPS: Object = {
  SIGN_TRANSACTION: ['to', 'value'],
};
