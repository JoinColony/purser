/* @flow */

import { fromString } from 'bip32-path';
import EthereumTx from 'ethereumjs-tx';

import {
  addressValidator,
  hexSequenceValidator,
  messageValidator,
} from '../core/validators';
import {
  derivationPathNormalizer,
  multipleOfTwoHexValueNormalizer,
  addressNormalizer,
  hexSequenceNormalizer,
} from '../core/normalizers';
import { warning, bigNumber, objectToErrorString } from '../core/utils';
import {
  transactionObjectValidator,
  messageObjectValidator,
} from '../core/helpers';
import { HEX_HASH_TYPE } from '../core/defaults';

import { payloadListener } from './helpers';
import { staticMethodsMessages as messages } from './messages';
import { STD_ERRORS } from './defaults';
import { PAYLOAD_SIGNTX, PAYLOAD_SIGNMSG, PAYLOAD_VERIFYMSG } from './payloads';

import type {
  TransactionObjectType,
  MessageObjectType,
} from '../core/flowtypes';

/**
 * Sign a transaction object and return the serialized signature (as a hex string)
 *
 * @method signTransaction
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
 * @return {Promise<string>} the hex signature string
 */
export const signTransaction = async (
  transactionObject: TransactionObjectType,
): Promise<string | void> => {
  const {
    derivationPath,
    gasPrice,
    gasLimit,
    chainId,
    nonce,
    to,
    value,
    inputData,
  } = transactionObjectValidator(transactionObject);
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
    address_n: fromString(derivationPath, true).toPathArray(),
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
    /* $FlowFixMe */
    nonce: multipleOfTwoHexValueNormalizer(nonce.toString(16)),
    /*
     * Trezor service requires the prefix from the address to be stripped
     */
    to: addressNormalizer(to, false),
    /* $FlowFixMe */
    value: multipleOfTwoHexValueNormalizer(value.toString(16)),
    /*
     * Trezor service requires the prefix from the input data to be stripped
     */
    data: hexSequenceNormalizer(inputData, false),
  });
  /*
   * We need to catch the cancelled error since it's part of a normal user workflow
   */
  try {
    /*
     * See fundamentals of Elliptic Curve Digital Signature Algorithm (ECDSA) to
     * get an general idea of where the three components come from:
     * https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
     *
     * Also, see EIP-155 for the 27 and 28 magic numbers expected in the recovery
     * parameter:
     * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
     *
     * Now, trezor will give you the recovery paramenter already encoded, but if you
     * want to derive the magic numbers again:
     *
     * recoveryParam - 35 - (chainId * 2)
     *
     * If the result is odd, then V is 27, if it's even, it's 28
     */
    const {
      r: rSignatureComponent,
      s: sSignatureComponent,
      v: recoveryParameter,
    }: Object = await payloadListener({ payload: modifiedPayloadObject });
    const signedTransaction: Object = await new EthereumTx({
      r: hexSequenceNormalizer(rSignatureComponent),
      s: hexSequenceNormalizer(sSignatureComponent),
      v: hexSequenceNormalizer(bigNumber(recoveryParameter).toString(16)),
    });
    return hexSequenceNormalizer(
      signedTransaction.serialize().toString(HEX_HASH_TYPE),
    );
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
 * Sign a message and return the signature. Useful for verifying addresses.
 * (In conjunction with `verifyMessage`)
 *
 * @method signMessage
 *
 * @param {string} path the derivation path for the account with which to sign the message
 * @param {string} message the message you want to sign
 *
 * All the above params are sent in as props of an {MessageObjectType} object.
 *
 * @return {Promise<string>} The signed message `hex` string (wrapped inside a `Promise`)
 */
export const signMessage = async (
  messageObject: MessageObjectType,
): Promise<string> => {
  const { derivationPath, message } = messageObjectValidator(messageObject);
  const { signature: signedMessage } = await payloadListener({
    payload: Object.assign({}, PAYLOAD_SIGNMSG, {
      /*
       * Path needs to be sent in as an derivation path array
       *
       * We also normalize it first (but for some reason Flow doesn't pick up
       * the default value value of `path` and assumes it's undefined -- it can be,
       * but it will not pass the validator)
       */
      path: fromString(
        /* $FlowFixMe */
        derivationPathNormalizer(derivationPath),
        true,
      ).toPathArray(),
      message,
    }),
  });
  /*
   * Add the hex `0x` prefix
   */
  return hexSequenceNormalizer(signedMessage);
};

/**
 * Verify a signed message. Useful for verifying addresses. (In conjunction with `signMessage`)
 *
 * @method verifyMessage
 *
 * @param {string} address The address that verified the original message (without the hex `0x` identifier)
 * @param {string} message The message to verify if it was signed correctly
 * @param {string} signature The message signature as a `hex` string (you usually get this via `signMessage`)
 *
 * All the above params are sent in as props of an {MessageObjectType} object.
 *
 * @return {Promise<boolean>} A boolean to indicate if the message/signature pair are valid (wrapped inside a `Promise`)
 */
export const verifyMessage = async ({
  address,
  message = '',
  signature = '',
}: MessageObjectType): Promise<boolean> => {
  /*
   * Check if the address is in the correct format
   */
  addressValidator(address);
  /*
   * Check if the messages is in the correct format
   */
  messageValidator(message);
  /*
   * Check if the signature is in the correct format
   */
  hexSequenceValidator(signature);
  /*
   * The Trezor service throws an Error if the signature is invalid.
   * We warn the user, but not throw an error, just return 'false'.
   *
   * This way you have a consistent return.
   */
  try {
    const { success: isMessageValid } = await payloadListener({
      payload: Object.assign({}, PAYLOAD_VERIFYMSG, {
        /*
         * Trezor service requires the prefix from the address to be stripped
         */
        address: addressNormalizer(address, false),
        message,
        /*
         * Trezor service requires the prefix from the signature to be stripped
         */
        signature: hexSequenceNormalizer(signature, false),
      }),
    });
    return isMessageValid;
  } catch (caughtError) {
    warning(
      `${
        messages.messageSignatureInvalid
      }: message (${message}), signature (${signature})`,
    );
    return false;
  }
};
