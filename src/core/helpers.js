/* @flow */

import { hashPersonalMessage, ecrecover } from 'ethereumjs-util';

import {
  derivationPathValidator,
  safeIntegerValidator,
  bigNumberValidator,
  addressValidator,
  hexSequenceValidator,
  messageValidator,
} from './validators';
import {
  addressNormalizer,
  derivationPathNormalizer,
  hexSequenceNormalizer,
  recoveryParamNormalizer,
} from './normalizers';
import { bigNumber, warning } from './utils';

import { helpers as helperMessages } from './messages';
import { PATH, TRANSACTION, HEX_HASH_TYPE } from './defaults';

import type {
  DerivationPathObjectType,
  TransactionObjectType,
  MessageObjectType,
  MessageVerificationObjectType,
} from './flowtypes';

/**
 * Serialize an derivation path object's props into it's string counterpart
 *
 * @method derivationPathSerializer
 *
 * @param {number} purpose path purpose
 * @param {number} coinType path coin type (and network)
 * @param {number} account path account number
 * @param {number} change path change number
 * @param {number} addressIndex address index (no default since it should be manually added)
 *
 * See the defaults file for some more information regarding the format of the
 * ethereum deviation path.
 *
 * All the above params are sent in as props of an {DerivationPathObjectType} object.
 *
 * @return {string} The serialized path
 */
export const derivationPathSerializer = ({
  purpose = PATH.PURPOSE,
  coinType = PATH.COIN_MAINNET,
  account = PATH.ACCOUNT,
  change,
  addressIndex,
}: DerivationPathObjectType = {}): string => {
  const { DELIMITER } = PATH;
  const hasChange = change || change === 0;
  const hasAddressIndex = addressIndex || addressIndex === 0;
  return (
    /*
     * It's using a template in the last spot, eslint just donesn't recognizes it...
     */
    /* eslint-disable-next-line prefer-template */
    `${PATH.HEADER_KEY}/${purpose}` +
    `${DELIMITER}${coinType}` +
    `${DELIMITER}${account}` +
    `${DELIMITER}` +
    /*
     * We're already checking if the change and address index has a value, so
     * we're not coercing `undefined`.
     *
     * Flow is overreacting again...
     */
    /* $FlowFixMe */
    `${hasChange ? change : ''}` +
    /* $FlowFixMe */
    (hasChange && hasAddressIndex ? `/${addressIndex}` : '')
  );
};

/**
 * Recover a public key from a message and the signature of that message.
 *
 * @TODO Add unit tests
 *
 * @NOTE Further optimization
 *
 * This can be further optimized by writing our own recovery mechanism since we already
 * do most of the cleanup, checking and coversions.
 *
 * All that is left to do is to use `secp256k1` to convert and recover the public key
 * from the signature points (components).
 *
 * But since most of our dependencies already use `ethereumjs-util` under the hood anyway,
 * it's easier just use it as well.
 *
 * @method recoverPublicKey
 *
 * @param {string} message The message string to hash for the signature verification procedure
 * @param {string} signature The signature to recover the private key from, as a `hex` string
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {String} The recovered public key.
 */
export const recoverPublicKey = ({
  message,
  signature,
}: MessageVerificationObjectType = {}): string => {
  const { verifyMessageSignature: messages } = helperMessages;
  const signatureBuffer = Buffer.from(
    /* $FlowFixMe */
    hexSequenceNormalizer(signature.toLowerCase(), false),
    HEX_HASH_TYPE,
  );
  /*
   * It should be 65 bits in legth:
   * - 32 for the (R) point (component)
   * - 32 for the (S) point (component)
   * - 1 for the reco(V)ery param
   */
  if (signatureBuffer.length !== 65) {
    throw new Error(messages.wrongLength);
  }
  /*
   * The recovery param is the the 64th bit of the signature Buffer
   */
  const recoveryParam = recoveryParamNormalizer(signatureBuffer[64]);
  const rComponent = signatureBuffer.slice(0, 32);
  const sComponent = signatureBuffer.slice(32, 64);
  const messageHash = hashPersonalMessage(Buffer.from(message));
  /*
   * Elliptic curve recovery.
   *
   * @NOTE `ecrecover` is just a helper method
   * Around `secp256k1`'s `recover()` and `publicKeyConvert()` methods
   *
   * This is to what the function description comment block note is referring  to
   */
  const recoveredPublicKeyBuffer = ecrecover(
    messageHash,
    recoveryParam,
    rComponent,
    sComponent,
  );
  /*
   * Only take the first 64 bits of the recovered public key.
   * Also add a `0x` prefix to it.
   *
   * @NOTE we're using 32 when `slice()`-ing since this in Buffer format.
   */
  return hexSequenceNormalizer(
    recoveredPublicKeyBuffer.slice(0, 32).toString(HEX_HASH_TYPE),
  );
};

/**
 * Verify a signed message.
 * By extracting it's public key from the signature and comparing it with a provided one.
 *
 * @TODO Refactor unit tests
 * After changing the way this method works
 *
 * @method verifyMessageSignature
 *
 * @param {string} publicKey Public key to check against, as a 'hex' string
 * @param {string} message The message string to hash for the signature verification procedure
 * @param {string} signature The signature to recover the private key from, as a `hex` string
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {boolean} true or false depending if the signature is valid or not
 *
 */
export const verifyMessageSignature = ({
  publicKey,
  message,
  signature,
}: MessageVerificationObjectType): boolean => {
  const { verifyMessageSignature: messages } = helperMessages;
  try {
    /*
     * Normalize the recovered public key by removing the `0x` preifx
     */
    const recoveredPublicKey: string = hexSequenceNormalizer(
      recoverPublicKey({ message, signature }),
      false,
    );
    /*
     * Remove the prefix (0x) and the header (first two bits) from the public key we
     * want to test against
     */
    const normalizedPublicKey: string = hexSequenceNormalizer(
      publicKey,
      false,
    ).slice(2);
    /*
     * Last 64 bits of the private should match the first 64 bits of the recovered public key
     *
     * @TODO Compare by matching
     *
     * This could be refactored to use regex for matching the two private keys (no more slicing bits).
     * For bonus points, the matcher could also ignore case, so we won't have to deal with
     * converting everything to lowecase just to prevent checksum mismatches.
     */
    return normalizedPublicKey === recoveredPublicKey;
  } catch (caughtError) {
    warning(`${messages.somethingWentWrong}. Error: ${caughtError.message}`, {
      level: 'high',
    });
    return false;
  }
};

/**
 * Validate an transaction object
 *
 * @NOTE We can only validate here, we can't also normalize (with the exception of the derivation path).
 * This is because different wallet types expect different value formats so we must normalize them
 * on a case by case basis.
 *
 * @method transactionObjectValidator
 *
 * @param {string} derivationPath the derivation path for the account with which to sign the transaction
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} chainId the id of the chain for which this transaction is intended
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to the transaction is sent
 * @param {bigNumber} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} inputData data appended to the transaction (as a `hex` string)
 *
 * All the above params are sent in as props of an {TransactionObjectType} object.
 *
 * @return {Object} The validated transaction object containing the exact passed in values
 */
export const transactionObjectValidator = ({
  /*
   * Path defaults to the "default" derivation path
   */
  derivationPath,
  gasPrice = bigNumber(TRANSACTION.GAS_PRICE),
  gasLimit = bigNumber(TRANSACTION.GAS_LIMIT),
  /*
   * Chain Id defaults to the one set on the provider but it can be overwritten
   */
  chainId,
  nonce = TRANSACTION.NONCE,
  to,
  value = bigNumber(TRANSACTION.VALUE),
  inputData = TRANSACTION.INPUT_DATA,
}: TransactionObjectType = {}): TransactionObjectType => {
  /*
   * Check if the derivation path is in the correct format
   */
  derivationPathValidator(derivationPath);
  /*
   * Check that the gas price is a big number
   */
  bigNumberValidator(gasPrice);
  /*
   * Check that the gas limit is a big number
   */
  bigNumberValidator(gasLimit);
  /*
   * Check if the chain id value is valid (a positive, safe integer)
   */
  safeIntegerValidator(chainId);
  /*
   * Check if the nonce value is valid (a positive, safe integer)
   */
  safeIntegerValidator(nonce);
  /*
   * Check if the address (`to` prop) is in the correct format
   */
  addressValidator(to);
  /*
   * Check that the value is a big number
   */
  bigNumberValidator(value);
  /*
   * Check that the input data prop is a valid hex string sequence
   */
  hexSequenceValidator(inputData);
  /*
   * Normalize the values and return them
   */
  return {
    derivationPath: derivationPathNormalizer(derivationPath),
    gasPrice,
    gasLimit,
    chainId,
    nonce,
    to,
    value,
    inputData,
  };
};

/**
 * Validate a message verification (message to be signed) object
 *
 * @method messageObjectValidator
 *
 * @param {string} derivationPath The derivation path for the account with which to sign the transaction
 * @param {string} message The message string you want to sign
 *
 * All the above params are sent in as props of an {MessageObjectType} object.
 *
 * @return {Object} The validated message object containing the exact passed in values
 */
export const messageObjectValidator = ({
  /*
   * Path defaults to the "default" derivation path
   */
  derivationPath,
  /*
   * For the Ledger wallet implementation we can't pass in an empty string, so
   * we try with the next best thing.
   */
  message = ' ',
}: MessageObjectType = {}): MessageObjectType => {
  /*
   * Check if the derivation path is in the correct format
   *
   * Flow doesn't even let us validate it.
   * It shoots first, asks questions later.
   */
  /* $FlowFixMe */
  derivationPathValidator(derivationPath);
  /*
   * Check if the messages is in the correct format
   */
  messageValidator(message);
  /*
   * Normalize the values and return them
   */
  return {
    /* $FlowFixMe */
    derivationPath: derivationPathNormalizer(derivationPath),
    message,
  };
};

/**
 * Validate a signature verification message object
 *
 * @method messageVerificationObjectValidator
 *
 * @param {string} address The address of the account that signed the message. Optional.
 * @param {string} publicKey The public key of the account that signed the message. Optional.
 * @param {string} message The message string to check the signature against
 * @param {string} signature The signature of the message.
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {Object} The validated signature object containing the exact passed in values
 */
export const messageVerificationObjectValidator = ({
  /*
   * Path defaults to the "default" address and/or publicKey
   */
  address,
  publicKey,
  /*
   * For the Ledger wallet implementation we can't pass in an empty string, so
   * we try with the next best thing.
   */
  message,
  signature,
}: MessageVerificationObjectType = {}): MessageVerificationObjectType => {
  const normalizedMessageVerificationObject: Object = {
    message,
  };
  if (address) {
    /*
     * Check if the address is in the correct format
     */
    addressValidator(address);
    /*
     * Ensure the address has the hex `0x` prefix
     */
    normalizedMessageVerificationObject.address = addressNormalizer(address);
  }
  if (publicKey) {
    /*
     * Check if the public key is in the correct format
     */
    hexSequenceValidator(publicKey);
    /*
     * Ensure the public has the hex `0x` prefix
     */
    normalizedMessageVerificationObject.publicKey = hexSequenceNormalizer(
      publicKey,
    );
  }
  /*
   * Check if the messages is in the correct format
   */
  messageValidator(message);
  /*
   * Check if the signature is in the correct format
   */
  hexSequenceValidator(signature);
  /*
   * Ensure the signature has the hex `0x` prefix
   */
  normalizedMessageVerificationObject.signature = hexSequenceNormalizer(
    signature,
  );
  return normalizedMessageVerificationObject;
};
