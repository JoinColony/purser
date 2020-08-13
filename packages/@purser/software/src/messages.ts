/* eslint-disable max-len */

export const walletClass = {
  noPassword:
    'You did not provide a password for encryption. This can be added at a later stage using the `keystore` property setter',
};

export const staticMethods = {
  noEntropy:
    "You did not provide entropy to help with randomness when generating the wallet. While this can be omitted, it's highly recommended. You could omiy this argument and it will provide it for you automatically",
  create:
    'There was an error in creating the wallet, check the arguments you are passing in',
  open:
    'Could not open the wallet with the method you provided. Please check the arguments you passed in:',
  cannotSign:
    'Cannot sign the transaction. Check the values you are passing in as the Transaction Object',
  cannotSignMessage:
    'Cannot sign the message. Check the message string you are passing in',
  cannotVerifySignature:
    'Cannot verify the signed message. Check the message string and signature you are passing in',
};
