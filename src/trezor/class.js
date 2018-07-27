/* @flow */

import GenericWallet from '../core/genericWallet';
import { DESCRIPTORS } from '../core/defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../core/types';
import type {
  TransactionObjectType,
  MessageObjectType,
  GenericClassArgumentsType,
} from '../core/flowtypes';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';

const { WALLET_PROPS } = DESCRIPTORS;

export default class TrezorWallet extends GenericWallet {
  constructor(propObject: GenericClassArgumentsType) {
    super(propObject);
    Object.defineProperties(this, {
      /*
       * Set the actual type and subtype (overwrite the generic ones)
       */
      type: Object.assign({}, { value: TYPE_HARDWARE }, WALLET_PROPS),
      subtype: Object.assign({}, { value: SUBTYPE_TREZOR }, WALLET_PROPS),
      /*
       * Overwrite the generic, empty, `sign()` method
       */
      sign: Object.assign(
        {},
        {
          value: async (transactionObject: TransactionObjectType) => {
            /*
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
      /*
       * Overwrite the generic, empty, `signMessage()` method
       */
      signMessage: Object.assign(
        {},
        {
          value: async ({ message }: MessageObjectType = {}) =>
            signMessage({
              path: await this.derivationPath,
              message,
            }),
        },
        WALLET_PROPS,
      ),
      /*
       * Overwrite the generic, empty, `verifyMessage()` method
       */
      verifyMessage: Object.assign(
        {},
        {
          value: async ({ message, signature }: MessageObjectType = {}) =>
            verifyMessage({ address: this.address, message, signature }),
        },
        WALLET_PROPS,
      ),
    });
  }
}
