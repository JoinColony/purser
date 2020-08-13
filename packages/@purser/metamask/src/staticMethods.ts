import {
  addressNormalizer,
  addressValidator,
  hexSequenceNormalizer,
  hexSequenceValidator,
  messageOrDataValidator,
  messageVerificationObjectValidator,
  warning,
} from '@purser/core';
import {
  TransactionRequest,
  TransactionResponse,
  Web3Provider,
} from 'ethers/providers';
import { verifyMessage as ethersVerifyMessage } from 'ethers/utils';

import { methodCaller } from './helpers';
import { SignMessageObject } from './types';
import { STD_ERRORS } from './constants';
import { staticMethods as messages } from './messages';

export const getTransaction = async (
  provider: Web3Provider,
  transactionHash: string,
): Promise<TransactionResponse> => {
  await provider.waitForTransaction(transactionHash);
  return provider.getTransaction(transactionHash);
};

export const signTransaction = async (
  provider: Web3Provider,
  tx: TransactionRequest,
): Promise<string> => {
  const signer = provider.getSigner();
  return methodCaller<Promise<string>>(async () => {
    if (tx.nonce) {
      /*
       * Metamask auto-sets the nonce based on the next one available. You can manually
       * override it, but it's best to omit it.
       *
       * We notify (in dev mode) the user about not setting the nonce.
       */
      warning(messages.dontSetNonce);
    }
    try {
      const txResponse = await signer.sendTransaction(tx);
      hexSequenceValidator(txResponse.hash);
      return hexSequenceNormalizer(txResponse.hash);
    } catch (error) {
      /*
       * If the user cancels signing the message we still throw,
       * but we customize the message
       */
      if (error.message.includes(STD_ERRORS.CANCEL_TX_SIGN)) {
        throw new Error(messages.cancelTransactionSign);
      }
      throw error;
    }
  }, messages.cannotSendTransaction);
};

export const signMessage = async (
  provider: Web3Provider,
  messageObject: SignMessageObject,
): Promise<string> => {
  if (messageObject === null || typeof messageObject !== 'object') {
    throw new Error(messages.signMessageArgumentMissing);
  }
  const { currentAddress, message, messageData } = messageObject;

  addressValidator(currentAddress);
  const toSign = messageOrDataValidator({ message, messageData });
  const signer = provider.getSigner();
  /*
   * We must check for the Metamask injected in-page proxy every time we
   * try to access it. This is because something can change it from the time
   * of last detection until now.
   */
  return methodCaller<Promise<string>>(async () => {
    try {
      const signature = await signer.signMessage(toSign);
      hexSequenceValidator(signature);
      return hexSequenceNormalizer(signature);
    } catch (error) {
      /*
       * If the user cancels signing the message we still throw,
       * but we customize the message
       */
      if (error.message.includes(STD_ERRORS.CANCEL_MSG_SIGN)) {
        throw new Error(messages.cancelMessageSign);
      }
      throw error;
    }
  }, messages.cannotSignMessage);
};

export const verifyMessage = async (obj: {
  message: string;
  signature: string;
  currentAddress: string;
}): Promise<boolean> => {
  const { currentAddress } = obj;
  addressValidator(currentAddress);
  const messageVerificationObject = {
    message: obj.message,
    signature: obj.signature,
  };
  const { message, signature } = messageVerificationObjectValidator(
    messageVerificationObject,
  );
  const recoveredAddress = ethersVerifyMessage(
    message,
    hexSequenceNormalizer(signature),
  );
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
  return normalizedRecoveredAddress === normalizedCurrentAddress;
};
