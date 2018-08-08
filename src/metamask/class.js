/* @flow */

import { addressValidator } from '../core/validators';

import { DESCRIPTORS } from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_METAMASK } from '../core/types';

import { addStateEventObserver } from './helpers';

import type { MetamaskWalletConstructorArgumentsType } from './flowtypes';

const { SETTERS, GENERIC_PROPS } = DESCRIPTORS;

/*
 * @TODO Add unit tests
 */
export default class MetamaskWallet {
  address: string;

  /*
   * `publicKey` prop is a getters.
   */
  publicKey: string;

  type: string;

  subtype: string;

  constructor({ address }: MetamaskWalletConstructorArgumentsType) {
    /*
     * Validate the address that's coming in from Metamask
     */
    addressValidator(address);
    Object.defineProperties(this, {
      /*
       * The initial address is set when `open()`-ing the wallet, but after that
       * it's updated via the Metamask state change observer.
       *
       * This way, we keep it in sync with the changes from Metamask's UI
       */
      address: Object.assign({}, { value: address }, SETTERS),
      type: Object.assign({}, { value: TYPE_SOFTWARE }, GENERIC_PROPS),
      subtype: Object.assign({}, { value: SUBTYPE_METAMASK }, GENERIC_PROPS),
    });
    /*
     * Set the state change observer
     *
     * This tracks updates Metamask's states and updates the local address
     * value if that changes in the UI
     */
    addStateEventObserver(state => {
      if (state && state.selectedAddress) {
        this.address = state.selectedAddress;
      }
    });
  }

  /*
   * Public Key Getter
   */
  /* eslint-disable-next-line class-methods-use-this */
  get publicKey(): Promise<string> {
    return Promise.resolve('');
  }
}
