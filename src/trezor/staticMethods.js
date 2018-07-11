/* @flow */

import { fromString } from 'bip32-path';

import { payloadListener } from './helpers';
import { warning, bigNumber, objectToErrorString } from '../utils';
import {
  derivationPathValidator,
  safeIntegerValidator,
  bigNumberValidator,
  addressValidator,
} from './validators';
import {
  derivationPathNormalizer,
  multipleOfTwoHexValueNormalizer,
  addressNormalizer,
} from './normalizers';

import { classMessages as messages } from './messages';
import { STD_ERRORS } from './defaults';
import { PAYLOAD_SIGNTX, PAYLOAD_SIGNMSG, PAYLOAD_VERIFYMSG } from './payloads';

import type { TransactionObjectType, MessageObjectType } from '../flowtypes';

/**
 * Sign a transaction and return the signed transaction.
 *
 * The signed transaction is composed of:
 * - Signature R component
 * - Signature S component
 * - Signature V component (recovery parameter)
 *
 * @TODO Validate transaction prop values
 * Something like `assert()` should work well here
 *
 * @method signTransaction
 *
 * @param {string} path the derivation path for the account with which to sign the transaction
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} chainId the id of the chain for which this transaction is intended
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to transaction is sent
 * @param {string} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} data data appended to the transaction (as a `hex` string)
 *
 * All the above params are sent in as props of an {TransactionObjectType} object.
 *
 * @return {Promise<Object>} the signed transaction composed of the three signature components (see above).
 */
export const signTransaction = async ({
  /*
   * Path defaults to the current selected "default" address path
   */
  path,
  gasPrice = bigNumber(9000000000),
  gasLimit = bigNumber(21000),
  /*
   * Chain Id defaults to the on set on the provider but it can be overwritten
   */
  chainId,
  /*
   * We can't currently use the object spread operator here because of some
   * Eslint 5 and airbnb ruleset lack of compatibility.
   *
   * @TODO Fix object spread operator
   */
  nonce = 0,
  to,
  value = bigNumber(1),
  data,
}: TransactionObjectType = {}) => {
  /*
   * Check if the derivation path is in the correct format
   */
  derivationPathValidator(path);
  /*
   * Check that the gas price is a big number
   */
  bigNumberValidator(gasPrice);
  /*
   * Check that the gas limit is a big number
   */
  bigNumberValidator(gasPrice);
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
   * Modify the default payload to set the transaction details
   */
  const modifiedPayloadObject: Object = Object.assign({}, PAYLOAD_SIGNTX, {
    /*
     * Path needs to be sent in as an derivation path array
     *
     * We also normalize it first (but for some reason Flow doesn't pick up
     * the default value of `path` and assumes it's undefined -- it can be,
     * but it will not pass the validator)
     */
    address_n: fromString(derivationPathNormalizer(path), true).toPathArray(),
    /*
     * We could really do with some BN.js flow types declarations :(
     */
    /* $FlowFixMe */
    gas_price: multipleOfTwoHexValueNormalizer(gasPrice.toString(16)),
    /* $FlowFixMe */
    gas_limit: multipleOfTwoHexValueNormalizer(gasLimit.toString(16)),
    chain_id: chainId,
    /*
     * Nonces needs to be sent in as a hex string, and to be padded as a multiple of two.
     * Eg: '3' to be '03', `12c` to be `012c`
     */
    nonce: multipleOfTwoHexValueNormalizer(nonce.toString(16)),
    /*
     * Trezor service requires the prefix from the address to be stripped
     */
    to: addressNormalizer(to, false),
    /* $FlowFixMe */
    value: multipleOfTwoHexValueNormalizer(value.toString(16)),
    data,
  });
  /*
   * We need to catch the cancelled error since it's part of a normal user workflow
   */
  try {
    const signedTransaction = await payloadListener({
      payload: modifiedPayloadObject,
    });
    return signedTransaction;
  } catch (caughtError) {
    /*
     * Don't throw an error if the user cancelled
     */
    if (caughtError.message === STD_ERRORS.CANCEL_TX_SIGN) {
      return warning(messages.userSignTxCancel);
    }
    /*
     * But throw otherwise, so we can see what's going on
     */
    throw new Error(
      `${messages.userSignTxGenericError}: ${objectToErrorString(
        modifiedPayloadObject,
      )} ${caughtError.message}`,
    );
  }
};

/**
 * Sign a message and return the signed signature. Usefull for varifying addresses.
 * (In conjunction with `verifyMessage`)
 *
 * @TODO Validate message prop values
 * Something like `assert()` should work well here
 *
 * @method signMessage
 *
 * @param {string} path the derivation path for the account with which to sign the message
 * @param {string} message the message you want to sign
 *
 * All the above params are sent in as props of an {MessageObjectType} object.
 *
 * @return {Promise<string>} The signed message `base64` string (wrapped inside a `Promise`)
 */
export const signMessage = async ({ path, message }: MessageObjectType) => {
  /*
   * Check if the derivation path is in the correct format
   *
   * Flow doesn't even let us validate it.
   * It shoots first, asks questions later.
   */
  /* $FlowFixMe */
  derivationPathValidator(path);
  const { signature: signedMessage } = await payloadListener({
    payload: Object.assign({}, PAYLOAD_SIGNMSG, {
      /*
       * Path needs to be sent in as an derivation path array
       *
       * We also normalize it first (but for some reason Flow doesn't pick up
       * the default value value of `path` and assumes it's undefined -- it can be,
       * but it will not pass the validator)
       */
      /* $FlowFixMe */
      path: fromString(derivationPathNormalizer(path), true).toPathArray(),
      message,
    }),
  });
  return signedMessage;
};

/**
 * Verify a signed message. Usefull for varifying addresses. (In conjunction with `signMessage`)
 *
 * @TODO Validate message prop values
 * Something like `assert()` should work well here
 *
 * @method verifyMessage
 *
 * @param {string} address The address that verified the original message (without the hex `0x` identifier)
 * @param {string} message The message to verify if it was signed correctly
 * @param {string} signature The message signature as a `base64` string (you usually get this via `signMessage`)
 *
 * All the above params are sent in as props of an {MessageObjectType} object.
 *
 * @return {Promise<boolean>} A boolean to indicate if the message/signature pair are valid (wrapped inside a `Promise`)
 */
export const verifyMessage = async ({
  address,
  message,
  signature,
}: MessageObjectType) => {
  /*
   * Check if the address is in the correct format
   */
  addressValidator(address);
  /*
   * @TODO Try/Catch the verify message call
   *
   * This is because this won't actually return `false` as the promise will fail.
   * This has to wait until the `reject()` case is handled in the helper.
   */
  const { success: isMessageValid } = await payloadListener({
    payload: Object.assign({}, PAYLOAD_VERIFYMSG, {
      /*
       * Trezor service requires the prefix from the address to be stripped
       */
      address: addressNormalizer(address, false),
      message,
      signature,
    }),
  });
  return isMessageValid;
};
