/* @flow */

import U2fTransport from '@ledgerhq/hw-transport-u2f';
import LedgerHwAppETH from '@ledgerhq/hw-app-eth';
import EthereumTx from 'ethereumjs-tx';

import {
  multipleOfTwoHexValueNormalizer,
  addressNormalizer,
  hexSequenceNormalizer,
} from '../core/normalizers';
import { hexSequenceValidator, messageValidator } from '../core/validators';
import { warning, objectToErrorString } from '../core/utils';
import {
  verifyMessageSignature,
  transactionObjectValidator,
  messageObjectValidator,
} from '../core/helpers';
import { HEX_HASH_TYPE, SIGNATURE } from '../core/defaults';

import { staticMethods as messages } from './messages';

import type {
  TransactionObjectType,
  MessageObjectType,
  MessageVerificationObjectType,
} from '../core/flowtypes';

/**
 * Sign a transaction object and return the serialized signature (as a hex string)
 *
 * @TODO Add unit tests
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
): Promise<string> => {
  const transport = await U2fTransport.create();
  const ethAppConnection = new LedgerHwAppETH(transport);
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
  try {
    /*
     * Ledger needs the unsigned "raw" transaction hex, which it will sign and
     * return the (R) and (S) signature components alog with the reco(V)ery param.
     *
     *
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
     */
    const unsignedTransaction = await new EthereumTx({
      /*
       * We could really do with some BN.js flow types declarations :(
       */
      gasPrice: hexSequenceNormalizer(
        /* $FlowFixMe */
        multipleOfTwoHexValueNormalizer(gasPrice.toString(16)),
      ),
      gasLimit: hexSequenceNormalizer(
        /* $FlowFixMe */
        multipleOfTwoHexValueNormalizer(gasLimit.toString(16)),
      ),
      chainId,
      /*
       * Nonces needs to be sent in as a hex string, and to be padded as a multiple of two.
       * Eg: '3' to be '03', `12c` to be `012c`
       */
      nonce: hexSequenceNormalizer(
        /* $FlowFixMe */
        multipleOfTwoHexValueNormalizer(nonce.toString(16)),
      ),
      /*
       * Trezor service requires the prefix from the address to be stripped
       */
      to: addressNormalizer(to),
      value: hexSequenceNormalizer(
        /* $FlowFixMe */
        multipleOfTwoHexValueNormalizer(value.toString(16)),
      ),
      // value: '0x00',
      /*
       * Trezor service requires the prefix from the input data to be stripped
       */
      data: hexSequenceNormalizer(inputData),
      /*
       * The transaction object needs to be seeded with the (R) and (S) signature components with
       * empty data, and the Reco(V)ery param as the chain id (all, im hex string format).
       *
       * See this issue for context:
       * https://github.com/LedgerHQ/ledgerjs/issues/43
       */
      r: hexSequenceNormalizer(
        multipleOfTwoHexValueNormalizer(String(SIGNATURE.R)),
      ),
      s: hexSequenceNormalizer(
        multipleOfTwoHexValueNormalizer(String(SIGNATURE.S)),
      ),
      v: hexSequenceNormalizer(
        /* $FlowFixMe */
        multipleOfTwoHexValueNormalizer(chainId.toString(16)),
      ),
    });
    /*
     * Sign the transaction object via your Ledger Wallet
     *
     * We also warn the user here, since the device will need confirmation, but only in dev mode.
     */
    warning(messages.userSignInteractionWarning);
    const {
      r: rSignatureComponent,
      s: sSignatureComponent,
      v: recoveryParameter,
    } = await ethAppConnection.signTransaction(
      derivationPath,
      unsignedTransaction.serialize().toString(HEX_HASH_TYPE),
    );
    /*
     * Proving that we signed the above transaction.
     *
     * @NOTE We need to modify the original transaction
     * Otherwise EthereumTx will complain because internally it checks for the valid instance
     */
    unsignedTransaction.r = hexSequenceNormalizer(rSignatureComponent);
    unsignedTransaction.s = hexSequenceNormalizer(sSignatureComponent);
    unsignedTransaction.v = hexSequenceNormalizer(recoveryParameter);
    const serializedSignedTransaction = unsignedTransaction
      .serialize()
      .toString(HEX_HASH_TYPE);
    /*
     * Add the hex prefix
     */
    return hexSequenceNormalizer(serializedSignedTransaction);
  } catch (caughtError) {
    throw new Error(
      `${messages.userSignTxGenericError}: ${objectToErrorString(
        transactionObject,
      )} ${caughtError.message}`,
    );
  }
};

/**
 * Sign a message and return the signature. Useful for verifying identities.
 *
 * @TODO Add unit tests
 *
 * @method signMessage
 *
 * @param {string} derivationPath the derivation path for the account with which to sign the message
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
  const transport = await U2fTransport.create();
  const ethAppConnection = new LedgerHwAppETH(transport);
  /*
   * Sign the message object via your Ledger Wallet
   *
   * We also warn the user here, since the device will need confirmation, but only in dev mode.
   */
  warning(messages.userSignMessageInteractionWarning);
  const {
    r: rSignatureComponent,
    s: sSignatureComponent,
    v: recoveryParameter,
  } = await ethAppConnection.signPersonalMessage(
    derivationPath,
    /*
     * The message needs to be sent in as an hex Buffer
     */
    /* $FlowFixMe */
    Buffer.from(message).toString(HEX_HASH_TYPE),
  );
  /*
   * Combine the (R), and (S) signature components, alogn with the reco(V)ery param (that
   * gets converted into `hex`)
   */
  return hexSequenceNormalizer(
    `${rSignatureComponent}` +
      `${sSignatureComponent}` +
      `${recoveryParameter.toString(16)}`,
  );
};

/**
 * Verify a signed message. Useful for verifying identity. (In conjunction with `signMessage`)
 *
 * @method verifyMessage
 *
 * @param {string} publicKey The public key to verify the signature agains (this is coming from the wallet instance)
 * @param {string} message The message to verify if it was signed correctly
 * @param {string} signature The message signature as a `hex` string (you usually get this via `signMessage`)
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {Promise<boolean>} A boolean to indicate if the message/signature pair are valid (wrapped inside a `Promise`)
 */
export const verifyMessage = async ({
  publicKey,
  message,
  signature,
}: MessageVerificationObjectType): Promise<boolean> => {
  /*
   * Check if the address is in the correct format
   */
  hexSequenceValidator(publicKey);
  /*
   * Check if the messages is in the correct format
   */
  messageValidator(message);
  /*
   * Check if the signature is in the correct format
   */
  hexSequenceValidator(signature);
  return verifyMessageSignature({
    /*
     * Ensure the public key has the `0x` prefix
     */
    publicKey: hexSequenceNormalizer(publicKey),
    message,
    /*
     * Ensure the signature has the `0x` prefix
     */
    signature: hexSequenceNormalizer(signature),
  });
};
