/* @flow */

import GenericWallet from '../core/genericWallet';
import { DESCRIPTORS } from '../core/defaults';
import { TYPE_HARDWARE, SUBTYPE_LEDGER } from '../core/types';
import type { GenericClassArgumentsType } from '../core/flowtypes';

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
    });
  }
}
