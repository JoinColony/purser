/* @flow */

import { warning } from '../core/utils';
import { hexSequenceValidator, addressValidator } from '../core/validators';
import { addressNormalizer, hexSequenceNormalizer } from '../core/normalizers';
import { transactionObjectValidator } from '../core/helpers';

import { methodCaller } from './helpers';
import { signTransaction as signTransactionMethodLink } from './methodLinks';

import { STD_ERRORS } from './defaults';
import { staticMethods as messages } from './messages';

export const signTransaction = async ({
  from,
  ...transactionObject
}: Object): Promise<string | void> => {
  const {
    gasPrice,
    gasLimit,
    to,
    value,
    nonce,
    inputData,
  } = transactionObjectValidator(transactionObject);
  addressValidator(from);
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
             * But we do convert the nonce to a String.
             */
            nonce: nonce.toString(),
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

const metamaskStaticMethods: Object = {
  signTransaction,
};

export default metamaskStaticMethods;
