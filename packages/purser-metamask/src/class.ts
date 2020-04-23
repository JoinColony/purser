import isEqual from 'lodash.isequal';

import { warning } from '@purser/core/utils';
import {
  recoverPublicKey as recoverPublicKeyHelper,
  userInputValidator,
} from '@purser/core/helpers';
import {
  addressValidator,
  hexSequenceValidator,
} from '@purser/core/validators';
import { hexSequenceNormalizer } from '@purser/core/normalizers';

import {
  DESCRIPTORS,
  HEX_HASH_TYPE,
  REQUIRED_PROPS,
} from '@purser/core/constants';
import {
  WalletType,
  WalletSubType,
  TransactionObjectType,
  MessageVerificationObjectType,
  TransactionObjectTypeWithAddresses,
} from '@purser/core/types';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';
import { methodCaller, setStateEventObserver } from './helpers';
import { validateMetamaskState } from './validators';
import { signMessage as signMessageMethodLink } from './methodLinks';

import { PUBLICKEY_RECOVERY_MESSAGE, STD_ERRORS } from './defaults';
import {
  MetamaskWallet as messages,
  staticMethods as staticMethodsMessages,
} from './messages';

import { MetamaskWalletConstructorArgumentsType } from './types';

const { SETTERS, GETTERS, GENERIC_PROPS, WALLET_PROPS } = DESCRIPTORS;

/*
 * "Private" (internal) variable(s).
 */
let state: Record<string, any> = {};
let internalPublicKey: string | void;

export default class MetamaskWallet {
  address: string;

  type: string;

  subtype: string;

  /*
   * @TODO Add specific Flow type
   *
   * See the core generic wallet for this, since that will implement them.
   * This will just use the ones declared there.
   */
  sign: (...any) => Promise<string>;

  signMessage: (...any) => Promise<string>;

  verifyMessage: (...any) => Promise<boolean>;

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
      address: { value: address, ...SETTERS },
      type: { value: WalletType.Software, ...GENERIC_PROPS },
      subtype: { value: WalletSubType.MetaMask, ...GENERIC_PROPS },
      sign: {
        value: async (
          transactionObject: TransactionObjectTypeWithAddresses,
        ) => {
          /*
           * Validate the trasaction's object input
           */
          userInputValidator({
            firstArgument: transactionObject,
          });
          return signTransaction({ ...transactionObject, from: this.address });
        },
        ...WALLET_PROPS,
      },
      signMessage: {
        value: async (messageObject: any = {}) => {
          /*
           * Validate the trasaction's object input
           */
          userInputValidator({
            firstArgument: messageObject,
            requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
          });
          return signMessage({
            currentAddress: this.address,
            message: messageObject.message,
            messageData: messageObject.messageData,
          });
        },
        ...WALLET_PROPS,
      },
      verifyMessage: {
        value: async (
          messageVerificationObject: MessageVerificationObjectType,
        ) => {
          /*
           * Validate the trasaction's object input
           */
          userInputValidator({
            firstArgument: messageVerificationObject,
            requiredAll: REQUIRED_PROPS.VERIFY_MESSAGE,
          });
          return verifyMessage({
            currentAddress: this.address,
            ...messageVerificationObject,
          });
        },
        ...WALLET_PROPS,
      },
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
       * @TODO Move into own (non-anonymous) method
       * This way we could better test it
       *
       * Set the state change observer
       *
       * This tracks updates Metamask's states and updates the local address
       * value if that changes in the UI
       */
      () =>
        setStateEventObserver(
          /*
           * @TODO Move into own (non-anonymous) method
           * This way we could better test it
           */
          (newState: any): boolean => {
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
                /*
                 * Reset the saved public key, as the address now changed
                 */
                internalPublicKey = undefined;
                return true;
              }
              return false;
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
    /*
     * We can't memoize the getter (as we do in most other such getters)
     *
     * This is because the address could change at any time leaving us with a
     * stale value for the public key, as there is no way (currently) to invalidate
     * this value.
     */
    if (internalPublicKey) {
      return Promise.resolve(internalPublicKey);
    }
    return MetamaskWallet.recoverPublicKey(this.address);
  }

  /**
   * Recover the public key from a signed message.
   * Sign a message, and use that signature to recover the (R), (S) signature
   * components, along with the reco(V)ery param. We then use those values to
   * recover, set internally, and return the public key.
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
      /*
       * @TODO Move into own (non-anonymous) method
       * This way we could better test it
       */
      () =>
        new Promise(resolve => {
          /*
           * Sign the message. This will prompt the user via Metamask's UI
           */
          signMessageMethodLink(
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
            /*
             * @TODO Move into own (non-anonymous) method
             * This way we could better test it
             */
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
                  return warning(staticMethodsMessages.cancelMessageSign);
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

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties(MetamaskWallet.prototype, {
  publicKey: GETTERS,
});
