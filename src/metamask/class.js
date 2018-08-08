/* @flow */

import isEqual from 'lodash.isequal';

import { warning } from '../core/utils';
import { recoverPublicKey as recoverPublicKeyHelper } from '../core/helpers';
import { addressValidator, hexSequenceValidator } from '../core/validators';
import { hexSequenceNormalizer } from '../core/normalizers';

import { DESCRIPTORS, HEX_HASH_TYPE } from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_METAMASK } from '../core/types';

import { methodCaller, setStateEventObserver } from './helpers';
import { validateMetamaskState } from './validators';
import { signMessage } from './methodLinks';
import { PUBLICKEY_RECOVERY_MESSAGE, STD_ERRORS } from './defaults';
import { MetamaskWallet as messages } from './messages';

import type { MetamaskWalletConstructorArgumentsType } from './flowtypes';

const { SETTERS, GENERIC_PROPS } = DESCRIPTORS;

/*
 * "Private" (internal) variable(s).
 */
let state: Object = {};
/* eslint-disable-next-line no-unused-vars */
let internalPublicKey: string | void;
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

  /**
   * Recover the public key from a signed message.
   * Sign a message, and use that signature to recover the (R), (S) signature
   * components, along with the reco(V)ery param. We then use those values to
   * recover, set internally, and return the public key.
   *
   * @TODO Add unit tests
   *
   * @method recoverPublicKey
   *
   * @param {string} currentAddress The current selected address.
   * Note the we don't need to validate this here since it comes from a trusted
   * source: the class constructor.
   *
   * @return {Promise} The recovered public key (for the currently selected addresss)
   */
  static async recoverPublicKey(currentAddress: string): Promise<string> {
    /*
     * We must check for the Metamask injected in-page proxy every time we
     * try to access it. This is because something can change it from the time
     * of last detection until now.
     */
    return methodCaller(
      () =>
        new Promise(resolve => {
          /*
           * Sign the message. This will prompt the user via Metamask's UI
           */
          signMessage(
            /*
             * Ensure the hex string has the `0x` prefix
             */
            hexSequenceNormalizer(
              /*
               * We could really do with default Flow types for Buffer...
               */
              /* $FlowFixMe */
              Buffer.from(PUBLICKEY_RECOVERY_MESSAGE).toString(HEX_HASH_TYPE),
            ),
            currentAddress,
            (error: Error, signature: string) => {
              try {
                /*
                 * Validate that the signature is in the correct format
                 */
                hexSequenceValidator(signature);
                const recoveredPublicKey: string = recoverPublicKeyHelper({
                  message: PUBLICKEY_RECOVERY_MESSAGE,
                  signature,
                });
                /*
                 * Add the `0x` prefix to the recovered public key
                 */
                const normalizedPublicKey: string = hexSequenceNormalizer(
                  recoveredPublicKey,
                );
                /*
                 * Also set the internal public key
                 */
                internalPublicKey = normalizedPublicKey;
                return resolve(normalizedPublicKey);
              } catch (caughtError) {
                /*
                 * Don't throw an Error if the user just cancels signing the message.
                 * This is normal UX, not an exception
                 */
                if (error.message.includes(STD_ERRORS.CANCEL_MSG_SIGN)) {
                  return warning(messages.cancelMessageSign);
                }
                throw new Error(error.message);
              }
            },
          );
        }),
      messages.cannotGetPublicKey,
    );
  }
}
