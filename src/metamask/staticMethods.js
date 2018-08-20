/* @flow */

import { warning } from '../core/utils';
import {
  hexSequenceValidator,
  addressValidator,
  safeIntegerValidator,
  messageValidator,
} from '../core/validators';
import { addressNormalizer, hexSequenceNormalizer } from '../core/normalizers';
import {
  transactionObjectValidator,
  messageVerificationObjectValidator,
} from '../core/helpers';

import { methodCaller } from './helpers';
import {
  signTransaction as signTransactionMethodLink,
  signMessage as signMessageMethodLink,
  verifyMessage as verifyMessageMethodLink,
} from './methodLinks';

import { HEX_HASH_TYPE } from '../core/defaults';
import { STD_ERRORS } from './defaults';
import { staticMethods as messages } from './messages';

/**
 * Sign (and send) a transaction object and return the serialized signature (as a hex string)
 *
 * @TODO Refactor to only sign the transaction
 * This is only after Metamask will allow us that functionality (see below)
 *
 * Metamask doesn't currently allow us to sign a transaction without also broadcasting it to
 * the network. See this issue for context:
 * https://github.com/MetaMask/metamask-extension/issues/3475
 *
 * @method signTransaction
 *
 * @param {string} from the sender address (provided by the Wallet instance)
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to the transaction is sent
 * @param {bigNumber} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} inputData data appended to the transaction (as a `hex` string)
 *
 * All the above params are sent in as props of an object.
 *
 * @return {Promise<string>} the hex signature string
 */
export const signTransaction = async ({
  from,
  nonce: manualNonce,
  ...transactionObject
}: Object = {}): Promise<string | void> => {
  const {
    gasPrice,
    gasLimit,
    to,
    value,
    inputData,
  } = transactionObjectValidator(transactionObject);
  addressValidator(from);
  /*
   * Metamask auto-sets the nonce based on the next one available. You can manually
   * override it, but it's best to omit it.
   *
   * So we only validate if there is one, otherwise we just pass undefined
   * to the transaction object.
   *
   * We also notify (in dev mode) the user about not setting the nonce.
   */
  if (manualNonce) {
    safeIntegerValidator(manualNonce);
    warning(messages.dontSetNonce);
  }
  /*
   * We must check for the Metamask injected in-page proxy every time we
   * try to access it. This is because something can change it from the time
   * of last detection until now.
   */
  return methodCaller(
    /*
     * @TODO Move into own (non-anonymous) method
     * This way we could better test it
     */
    () =>
      new Promise(resolve =>
        signTransactionMethodLink(
          {
            from: addressNormalizer(from),
            to: addressNormalizer(to),
            /*
            * We don't need to normalize these three values since Metamask accepts
            * number values directly, so we don't need to convert them to hex
            */
            value: value.toString(),
            gas: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
            data: hexSequenceNormalizer(inputData),
            /*
             * Most likely this value is `undefined`, but that is good (see above)
             */
            nonce: manualNonce,
          },
          /*
           * @TODO Move into own (non-anonymous) method
           * This way we could better test it
           */
          (error: Error, transactionHash: string) => {
            try {
              /*
               * Validate that the signature hash is in the correct format
               */
              hexSequenceValidator(transactionHash);
              /*
               * Add the `0x` prefix to the signed transaction hash
               */
              const normalizedTransactionHash: string = hexSequenceNormalizer(
                transactionHash,
              );
              return resolve(normalizedTransactionHash);
            } catch (caughtError) {
              /*
               * Don't throw an Error if the user just cancels signing transaction.
               * This is normal UX, not an exception
               */
              if (error.message.includes(STD_ERRORS.CANCEL_TX_SIGN)) {
                return warning(messages.cancelTransactionSign);
              }
              throw new Error(error.message);
            }
          },
        ),
      ),
    messages.cannotSendTransaction,
  );
};

/**
 * Sign a message and return the signature. Useful for verifying identities.
 *
 * @method signMessage
 *
 * @param {string} currentAddress The current selected address (in the UI)
 * @param {string} message the message you want to sign
 *
 * All the above params are sent in as props of an {object.
 *
 * @return {Promise<string>} The signed message `hex` string (wrapped inside a `Promise`)
 */
export const signMessage = async ({
  currentAddress,
  message,
}: Object = {}): Promise<string | void> => {
  addressValidator(currentAddress);
  messageValidator(message);
  /*
   * We must check for the Metamask injected in-page proxy every time we
   * try to access it. This is because something can change it from the time
   * of last detection until now.
   */
  return methodCaller(
    /*
     * @TODO Move into own (non-anonymous) method
     * This way we could better test it
     */
    () =>
      new Promise(resolve => {
        /*
         * Sign the message. This will prompt the user via Metamask's UI
         */
        signMessageMethodLink(
          /*
           * Ensure the hex string has the `0x` prefix
           */
          hexSequenceNormalizer(
            /*
             * We could really do with default Flow types for Buffer...
             */
            /* $FlowFixMe */
            Buffer.from(message).toString(HEX_HASH_TYPE),
          ),
          currentAddress,
          /*
           * @TODO Move into own (non-anonymous) method
           * This way we could better test it
           */
          (error: Error, messageSignature: string) => {
            try {
              /*
               * Validate that the signature is in the correct format
               */
              hexSequenceValidator(messageSignature);
              /*
               * Add the `0x` prefix to the message's signature
               */
              const normalizedSignature: string = hexSequenceNormalizer(
                messageSignature,
              );
              return resolve(normalizedSignature);
            } catch (caughtError) {
              /*
               * Don't throw an Error if the user just cancels signing the message.
               * This is normal UX, not an exception
               */
              if (error.message.includes(STD_ERRORS.CANCEL_MSG_SIGN)) {
                return warning(messages.cancelMessageSign);
              }
              throw new Error(error.message);
            }
          },
        );
      }),
    messages.cannotSignMessage,
  );
};

/**
 * Verify a signed message. Useful for verifying identity. (In conjunction with `signMessage`)
 *
 * @method verifyMessage
 *
 * @param {string} message The message to verify if it was signed correctly
 * @param {string} signature The message signature as a `hex` string (you usually get this via `signMessage`)
 * @param {string} currentAddress The current selected address (in the UI)
 *
 * All the above params are sent in as props of an object.
 *
 * @return {Promise<boolean>} A boolean to indicate if the message/signature pair are valid (wrapped inside a `Promise`)
 */
export const verifyMessage = async ({
  currentAddress,
  ...messageVerificationObject
}: Object = {}) => {
  /*
   * Validate the current address
   */
  addressValidator(currentAddress);
  /*
   * Validate the rest of the pros using the core helper
   */
  const { message, signature } = messageVerificationObjectValidator(
    messageVerificationObject,
  );
  /*
   * We must check for the Metamask injected in-page proxy every time we
   * try to access it. This is because something can change it from the time
   * of last detection until now.
   */
  return methodCaller(
    /*
     * @TODO Move into own (non-anonymous) method
     * This way we could better test it
     */
    () =>
      new Promise(resolve => {
        /*
         * Verify the message
         */
        verifyMessageMethodLink(
          message,
          /*
           * Ensure the signature has the `0x` prefix
           */
          hexSequenceNormalizer(signature),
          /*
           * @TODO Move into own (non-anonymous) method
           * This way we could better test it
           */
          (error: Error, recoveredAddress: string) => {
            try {
              /*
               * Validate that the recovered address is correct
               */
              addressValidator(recoveredAddress);
              /*
               * Add the `0x` prefix to the recovered address
               */
              const normalizedRecoveredAddress: string = addressNormalizer(
                recoveredAddress,
              );
              /*
               * Add the `0x` prefix to the current address
               */
              const normalizedCurrentAddress: string = addressNormalizer(
                currentAddress,
              );
              return resolve(
                normalizedRecoveredAddress === normalizedCurrentAddress,
              );
            } catch (caughtError) {
              throw new Error(error.message);
            }
          },
        );
      }),
    messages.cannotSignMessage,
  );
};
