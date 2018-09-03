/* @flow */

import GenericWallet from '../core/genericWallet';
import { userInputValidator } from '../core/helpers';
import { DESCRIPTORS, REQUIRED_PROPS } from '../core/defaults';
import { TYPE_HARDWARE, SUBTYPE_LEDGER } from '../core/types';
import type {
  GenericClassArgumentsType,
  TransactionObjectType,
  MessageVerificationObjectType,
} from '../core/flowtypes';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';

const { WALLET_PROPS } = DESCRIPTORS;

export default class LedgerWallet extends GenericWallet {
  constructor(propObject: GenericClassArgumentsType) {
    super(propObject);
    Object.defineProperties(this, {
      /*
       * Set the actual type and subtype (overwrite the generic ones)
       */
      type: Object.assign({}, { value: TYPE_HARDWARE }, WALLET_PROPS),
      subtype: Object.assign({}, { value: SUBTYPE_LEDGER }, WALLET_PROPS),
      sign: Object.assign(
        {},
        {
          value: async (transactionObject: TransactionObjectType) => {
            /*
             * Validate the trasaction's object input
             */
            userInputValidator({
              firstArgument: transactionObject,
              requiredAll: REQUIRED_PROPS.SIGN_TRANSACTION,
            });
            const { chainId = this.chainId } = transactionObject || {};
            return signTransaction(
              Object.assign({}, transactionObject, {
                derivationPath: await this.derivationPath,
                chainId,
              }),
            );
          },
        },
        WALLET_PROPS,
      ),
      signMessage: Object.assign(
        {},
        {
          value: async (messageObject: Object = {}) => {
            /*
             * Validate the trasaction's object input
             */
            userInputValidator({
              firstArgument: messageObject,
              requiredAll: REQUIRED_PROPS.SIGN_MESSAGE,
            });
            return signMessage({
              derivationPath: await this.derivationPath,
              message: messageObject.message,
            });
          },
        },
        WALLET_PROPS,
      ),
      verifyMessage: Object.assign(
        {},
        {
          value: async ({
            message,
            signature,
          }: MessageVerificationObjectType = {}) =>
            verifyMessage({
              publicKey: await this.publicKey,
              message,
              signature,
            }),
        },
        WALLET_PROPS,
      ),
    });
  }
}
