/* @flow */

import GenericWallet from '../core/genericWallet';
import { DESCRIPTORS } from '../core/defaults';
import { TYPE_HARDWARE, SUBTYPE_LEDGER } from '../core/types';
import type {
  GenericClassArgumentsType,
  TransactionObjectType,
  MessageObjectType,
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
             * @NOTE This is pretty complicated setup
             *
             * Needlesly complicated I might add, luckly this will all be removed
             * when we strip all providers out.
             *
             * For some reason prettier always suggests a way to fix this that would
             * violate the 80 max-len rule. Wierd
             */
            /* eslint-disable prettier/prettier */
            const {
              chainId = (this.provider && this.provider.chainId) || 1,
            } = transactionObject || {};
            /* eslint-enable prettier/prettier */
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
          value: async ({ message }: MessageObjectType = {}) =>
            signMessage({
              derivationPath: await this.derivationPath,
              message,
            }),
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
