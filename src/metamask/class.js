/* @flow */

import isEqual from 'lodash.isequal';

import { addressValidator } from '../core/validators';

import { DESCRIPTORS } from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_METAMASK } from '../core/types';

import { methodCaller, setStateEventObserver } from './helpers';
import { validateMetamaskState } from './validators';
import { MetamaskWallet as messages } from './messages';

import type { MetamaskWalletConstructorArgumentsType } from './flowtypes';

const { SETTERS, GENERIC_PROPS } = DESCRIPTORS;

/*
 * "Private" (internal) variable(s).
 */
let state: Object = {};
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
     * We must check for the Metamask injected in-page proxy every time we
     * try to access it. This is because something can change it from the time
     * of last detection until now.
     *
     * So we must ensure, again, that we have a state update event to hook
     * our update method onto.
     */
    methodCaller(
      /*
       * Set the state change observer
       *
       * This tracks updates Metamask's states and updates the local address
       * value if that changes in the UI
       */
      () =>
        setStateEventObserver(
          (newState: Object): boolean => {
            try {
              /*
               * Validate the state object that's coming in.
               * It should have all the props needed for us to work with.
               *
               * If they aren't there, it means that either Metamask is locked,
               * or somebody tampered with them.
               */
              validateMetamaskState(newState);
              /*
               * We only update the values if the state has changed.
               * (We're using lodash here to deep compare the two state objects)
               */
              if (!isEqual(state, newState)) {
                state = newState;
                this.address = newState.selectedAddress;
              }
              return true;
            } catch (caughtError) {
              /*
               * We don't want to throw or stop execution, so in the case that the
               * state doesn't validate, and update and silently return `false`.
               */
              return false;
            }
          },
        ),
      messages.cannotObserve,
    );
  }

  /*
   * Public Key Getter
   */
  /* eslint-disable-next-line class-methods-use-this */
  get publicKey(): Promise<string> {
    return Promise.resolve('');
  }
}
