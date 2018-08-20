/* @flow */

import { hashPersonalMessage, ecrecover } from 'ethereumjs-util';

import {
  safeIntegerValidator,
  bigNumberValidator,
  addressValidator,
  hexSequenceValidator,
  messageValidator,
} from './validators';
import { hexSequenceNormalizer, recoveryParamNormalizer } from './normalizers';
import { bigNumber, warning } from './utils';

import { helpers as helperMessages } from './messages';
import { PATH, TRANSACTION, HEX_HASH_TYPE } from './defaults';

import type {
  DerivationPathObjectType,
  TransactionObjectType,
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
   * Normalize and return the recovered public key
   */
  return hexSequenceNormalizer(
    recoveredPublicKeyBuffer.toString(HEX_HASH_TYPE),
  );
};

/**
 * Verify a signed message.
 * By extracting it's public key from the signature and comparing it with a provided one.
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
}: Object): boolean => {
  const { verifyMessageSignature: messages } = helperMessages;
  try {
    /*
     * Normalize the recovered public key by removing the `0x` preifx
     */
    const recoveredPublicKey: string = hexSequenceNormalizer(
      /*
       * We need this little go-around trick to mock just one export of
       * the module, while leaving the rest of the module intact so we can test it
       *
       * See: https://github.com/facebook/jest/issues/936
       */
      /* eslint-disable-next-line no-use-before-define */
      coreHelpers.recoverPublicKey({ message, signature }),
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
     */
    return !!recoveredPublicKey.includes(normalizedPublicKey);
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
 * @NOTE We can only validate here, we can't also normalize. This is because different
 * wallet types expect different value formats so we must normalize them on a case by case basis.
 *
 * @method transactionObjectValidator
 *
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} chainId the id of the chain for which this transaction is intended. Defaults to 1
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to the transaction is sent
 * @param {bigNumber} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} inputData data appended to the transaction (as a `hex` string)
 *
 * All the above params are sent in as props of an {TransactionObjectType} object.
 *
 * @return {TransactionObjectType} The validated transaction object containing the exact passed in values
 */
export const transactionObjectValidator = ({
  gasPrice = bigNumber(TRANSACTION.GAS_PRICE),
  gasLimit = bigNumber(TRANSACTION.GAS_LIMIT),
  chainId = TRANSACTION.CHAIN_ID,
  nonce = TRANSACTION.NONCE,
  /*
   * The only one prop value actually required to be passed in by the user
   */
  to,
  value = bigNumber(TRANSACTION.VALUE),
  inputData = TRANSACTION.INPUT_DATA,
}: TransactionObjectType = {}): TransactionObjectType => {
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
 * Validate a signature verification message object
 *
 * @method messageVerificationObjectValidator
 *
 * @param {string} message The message string to check the signature against
 * @param {string} signature The signature of the message.
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {Object} The validated signature object containing the exact passed in values
 */
export const messageVerificationObjectValidator = ({
  /*
   * For the Ledger wallet implementation we can't pass in an empty string, so
   * we try with the next best thing.
   */
  message,
  signature,
}: MessageVerificationObjectType = {}): MessageVerificationObjectType => {
  /*
   * Check if the messages is in the correct format
   */
  messageValidator(message);
  /*
   * Check if the signature is in the correct format
   */
  hexSequenceValidator(signature);
  return {
    message,
    /*
     * Ensure the signature has the hex `0x` prefix
     */
    signature: hexSequenceNormalizer(signature),
  };
};

/*
 * This default export is only here to help us with testing, otherwise
 * it wound't be needed
 */
const coreHelpers: Object = {
  derivationPathSerializer,
  recoverPublicKey,
  verifyMessageSignature,
  transactionObjectValidator,
  messageVerificationObjectValidator,
};

export default coreHelpers;
