/* @flow */

import GenericWallet from '../core/genericWallet';
import { DESCRIPTORS } from '../core/defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../core/types';
import type {
  TransactionObjectType,
  MessageObjectType,
  GenericClassArgumentsType,
  MessageVerificationObjectType,
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
            verifyMessage({ address: this.address, message, signature }),
        },
        WALLET_PROPS,
      ),
    });
  }
}
