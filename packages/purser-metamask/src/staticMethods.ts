import { Transaction as EthereumTx, TransactionOptions } from 'ethereumjs-tx';
import BigNumber from 'bn.js';
import { awaitTx } from 'await-transaction-mined';

import { warning } from '@purser/core/utils';
import {
  hexSequenceValidator,
  addressValidator,
  safeIntegerValidator,
} from '@purser/core/validators';
import {
  addressNormalizer,
  hexSequenceNormalizer,
} from '@purser/core/normalizers';
import {
  transactionObjectValidator,
  messageVerificationObjectValidator,
  messageOrDataValidator,
  getChainDefinition,
} from '@purser/core/helpers';

import { HEX_HASH_TYPE } from '@purser/core/defaults';

import {
  MessageVerificationObjectType,
  TransactionObjectTypeWithAddresses,
  TransactionObjectTypeWithTo,
} from '@purser/core/types';
import { throwError } from 'ethers/errors';
import { methodCaller } from './helpers';
import {
  getTransaction as getTransactionMethodLink,
  signTransaction as signTransactionMethodLink,
  signMessage as signMessageMethodLink,
  verifyMessage as verifyMessageMethodLink,
} from './methodLinks';

import { STD_ERRORS } from './defaults';
import { staticMethods as messages } from './messages';

import { Web3TransactionType } from './types';

/**
 * Get a transaction, with a workaround for some providers not returning
 * a pending transaction.
 *
 * If the transaction was not immediately returned, it's possible that
 * Infura is being used, and it isn't responding to `eth_getTransaction`
 * in the expected way (i.e. it isn't returning anything because the
 * transaction is not yet confirmed).
 *
 * This method uses a web3 0.20.x-compatible means of waiting for the
 * transaction to be confirmed (which will resolve to the receipt,
 * or reject if the transaction could not be confirmed.
 *
 * This can probably be removed when MetaMask has its own workaround.
 * See https://github.com/MetaMask/metamask-extension/issues/6704
 */
export const getTransaction = async (
  transactionHash: string,
): Promise<Web3TransactionType> => {
  const receiptPromise = awaitTx((global as any).web3, transactionHash, {
    blocksToWait: 1,
  });

  const transaction = await getTransactionMethodLink(transactionHash);
  if (transaction) {
    return transaction;
  }

  await receiptPromise;

  return getTransactionMethodLink(transactionHash);
};

export const signTransactionCallback = (
  chainId: number,
  resolve: (string) => void,
  reject: (Error) => void,
) => async (error: Error, transactionHash: string) => {
  try {
    if (error) {
      /*
       * If the user cancels signing the transaction we still throw,
       * but we customize the message.
       */
      if (error.message.includes(STD_ERRORS.CANCEL_TX_SIGN)) {
        throw new Error(messages.cancelTransactionSign);
      }
      throw new Error(error.message);
    }

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
    /*
     * Get signed transaction object with transaction hash using Web3
     * Include signature + any values MetaMask may have changed.
     */
    const {
      gas,
      gasPrice: signedGasPrice,
      input: signedData,
      nonce,
      r,
      s,
      to: signedTo,
      v,
      value: signedValue,
    } = await getTransaction(normalizedTransactionHash);
    /*
     * RLP encode (to hex string) with ethereumjs-tx, prefix with
     * `0x` and return. Convert to BN all the numbers-as-strings.
     */
    const signedTransaction = new EthereumTx(
      {
        data: signedData,
        gasLimit: new BigNumber(gas),
        gasPrice: new BigNumber(signedGasPrice),
        nonce: new BigNumber(nonce),
        r,
        s,
        to: signedTo,
        v,
        value: new BigNumber(signedValue),
      },
      // new class implements TransactionOptions {}
      getChainDefinition(chainId),
    );

    const to: TransactionOptions = {};

    const serializedSignedTransaction = signedTransaction
      .serialize()
      .toString(HEX_HASH_TYPE);
    const normalizedSignedTransaction = hexSequenceNormalizer(
      serializedSignedTransaction,
    );
    return resolve(normalizedSignedTransaction);
  } catch (caughtError) {
    return reject(caughtError);
  }
};

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
export const signTransaction = async (
  obj: TransactionObjectTypeWithAddresses,
): Promise<string | void> => {
  const transactionObject: TransactionObjectTypeWithTo = {
    chainId: obj.chainId,
    gasPrice: obj.gasPrice,
    gasLimit: obj.gasLimit,
    nonce: obj.nonce,
    value: obj.value,
    inputData: obj.inputData,
    to: obj.to,
  };
  const manualNonce = transactionObject.nonce;
  const {
    chainId,
    gasPrice,
    gasLimit,
    to,
    value,
    inputData,
    nonce,
  } = transactionObjectValidator(transactionObject);
  const { from } = obj;

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
      new Promise((resolve, reject) =>
        signTransactionMethodLink(
          {
            from: addressNormalizer(from),
            /*
             * We don't need to normalize these three values since Metamask accepts
             * number values directly, so we don't need to convert them to hex
             */
            value: value.toString(),
            gas: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
            data: hexSequenceNormalizer(inputData),
            chainId,
            /*
             * Most likely this value is `undefined`, but that is good (see above)
             */
            nonce,
            /*
             * Only send (and normalize) the destination address if one was
             * provided in the initial transaction object.
             */
            ...(to ? { to: addressNormalizer(to) } : {}),
          },
          signTransactionCallback(chainId, resolve, reject),
        ),
      ),
    messages.cannotSendTransaction,
  );
};

export const signMessageCallback = (
  resolve: (string) => void,
  reject: (Error) => void,
) => (error: Error, messageSignature: string) => {
  try {
    if (error) {
      /*
       * If the user cancels signing the message we still throw,
       * but we customize the message
       */
      if (error.message.includes(STD_ERRORS.CANCEL_MSG_SIGN)) {
        throw new Error(messages.cancelMessageSign);
      }
      throw new Error(error.message);
    }

    /*
     * Validate that the signature is in the correct format
     */
    hexSequenceValidator(messageSignature);
    /*
     * Add the `0x` prefix to the message's signature
     */
    const normalizedSignature: string = hexSequenceNormalizer(messageSignature);
    return resolve(normalizedSignature);
  } catch (caughtError) {
    return reject(caughtError);
  }
};

/**
 * Sign a message and return the signature. Useful for verifying identities.
 *
 * @method signMessage
 *
 * @param {string} currentAddress The current selected address (in the UI)
 * @param {string} message the message you want to sign
 * @param {any} messageData the message data (hex string or UInt8Array) you want to sign
 *
 * All the above params are sent in as props of an {object.
 *
 * @return {Promise<string>} The signed message `hex` string (wrapped inside a `Promise`)
 */
export const signMessage = async (obj: {
  currentAddress: string;
  message: string;
  messageData: any;
}): Promise<string | void> => {
  if (obj === null || typeof obj !== 'object') {
    throw new Error(messages.signMessageArgumentMissing);
  }
  const { currentAddress, message, messageData } = obj;

  addressValidator(currentAddress);
  const toSign = messageOrDataValidator({ message, messageData });
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
      new Promise((resolve, reject) => {
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
            Buffer.from(toSign).toString(HEX_HASH_TYPE),
          ),
          currentAddress,
          signMessageCallback(resolve, reject),
        );
      }),
    messages.cannotSignMessage,
  );
};

export const verifyMessageCallback = (
  currentAddress: string,
  resolve: (boolean) => void,
  reject: (Error) => void,
) => (error: Error, recoveredAddress: string) => {
  try {
    if (error) {
      throw new Error(error.message);
    }

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
    const normalizedCurrentAddress: string = addressNormalizer(currentAddress);
    return resolve(normalizedRecoveredAddress === normalizedCurrentAddress);
  } catch (caughtError) {
    return reject(caughtError);
  }
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
export const verifyMessage = async (obj: {
  message: string;
  signature: string;
  currentAddress: string;
}) => {
  const { currentAddress } = obj;
  const messageVerificationObject = {
    message: obj.message,
    signature: obj.signature,
  };

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
      new Promise((resolve, reject) => {
        /*
         * Verify the message
         */
        verifyMessageMethodLink(
          message,
          /*
           * Ensure the signature has the `0x` prefix
           */
          hexSequenceNormalizer(signature),
          verifyMessageCallback(currentAddress, resolve, reject),
        );
      }),
    messages.cannotSignMessage,
  );
};
