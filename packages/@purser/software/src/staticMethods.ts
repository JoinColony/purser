import {
  bigNumberify,
  verifyMessage as verifyEthersMessage,
} from 'ethers/utils';

import {
  addressNormalizer,
  addressValidator,
  hexSequenceNormalizer,
  messageVerificationObjectValidator,
  messageOrDataValidator,
  objectToErrorString,
  transactionObjectValidator,
} from '@purser/core';

import type {
  TransactionObjectTypeWithCallback,
  VerifyMessageData,
} from '@purser/core';

import { staticMethods as messages } from './messages';

/**
 * Sign a transaction object and return the serialized signature (as a hex string)
 *
 * @method signTransaction
 *
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} chainId the id of the chain for which this transaction is intended
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to the transaction is sent
 * @param {bigNumber} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} inputData data appended to the transaction (as a `hex` string)
 * @param {function} callback Ethers method to call with the validated transaction object
 *
 * All the above params are sent in as props of an {TransactionObjectType} object.
 *
 * @return {Promise<string>} the hex signature string
 */
export const signTransaction = async ({
  callback,
  ...tx
}: TransactionObjectTypeWithCallback): Promise<string> => {
  const {
    gasPrice,
    gasLimit,
    chainId,
    nonce,
    to,
    value,
    inputData,
  } = transactionObjectValidator(tx);
  try {
    const signedTransaction: string = await callback({
      /*
       * Ethers needs it's own "proprietary" version of bignumber to work.
       */
      gasPrice: bigNumberify(gasPrice.toString()),
      /*
       * Ethers needs it's own "proprietary" version of bignumber to work.
       */
      gasLimit: bigNumberify(gasLimit.toString()),
      chainId,
      nonce,
      /*
       * Ethers needs it's own "proprietary" version of bignumber to work.
       */
      value: bigNumberify(value.toString()),
      data: hexSequenceNormalizer(inputData),
      /*
       * Only send (and normalize) the destination address if one was
       * provided in the initial transaction object.
       */
      to: to ? addressNormalizer(to) : undefined,
    });
    return hexSequenceNormalizer(signedTransaction);
  } catch (caughtError) {
    throw new Error(
      `${messages.cannotSign} ${objectToErrorString({
        gasPrice,
        gasLimit,
        chainId,
        nonce,
        to,
        value,
        inputData,
      })} Error: ${caughtError.message}`,
    );
  }
};

/**
 * Sign a message and return the signature. Useful for verifying identities.
 *
 * @method signMessage
 *
 * @param {string} message the message you want to sign
 * @param {string} messageData the message you want to sign
 * @param {function} callback Ethers method to call with the validated message string
 *
 * All the above params are sent in as props of an {object}. Note that only one
 * of message or messageData can be set (enforced in class).
 *
 * @return {Promise<string>} The signed message `hex` string (wrapped inside a `Promise`)
 */
export const signMessage = async ({
  message,
  messageData,
  callback,
}: {
  message: string;
  messageData: string | Uint8Array;
  callback: (toSign: string | Uint8Array) => string;
}): Promise<string> => {
  /*
   * Validate input value
   */
  const toSign = messageOrDataValidator({ message, messageData });
  try {
    const messageSignature = await callback(toSign);
    /*
     * Normalize the message signature
     */
    return hexSequenceNormalizer(messageSignature);
  } catch (caughtError) {
    throw new Error(
      `${messages.cannotSignMessage}: ${message} Error: ${caughtError.message}`,
    );
  }
};

/**
 * Verify a signed message. Useful for verifying identity. (In conjunction with `signMessage`)
 *
 * @method verifyMessage
 *
 * @param {string} address The wallet address to verify the signature against
 * @param {string} message The message to verify if it was signed correctly
 * @param {string} signature The message signature as a `hex` string (you usually get this via `signMessage`)
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {Promise<boolean>} A boolean to indicate if the message/signature pair are valid (wrapped inside a `Promise`)
 */
export const verifyMessage = async (
  signatureMessage: VerifyMessageData & { address: string },
): Promise<boolean> => {
  const { address } = signatureMessage;

  /*
   * Validate the address locally
   */
  addressValidator(address);
  /*
   * Validate the rest of the pros using the core helper
   */
  const { message, signature } = messageVerificationObjectValidator(
    signatureMessage,
  );
  try {
    const recoveredAddress: string = verifyEthersMessage(message, signature);
    /*
     * Validate the recovered address
     */
    addressValidator(recoveredAddress);
    return address === recoveredAddress;
  } catch (caughtError) {
    throw new Error(
      `${messages.cannotVerifySignature} ${objectToErrorString(
        signatureMessage,
      )} Error: ${caughtError.message}`,
    );
  }
};
