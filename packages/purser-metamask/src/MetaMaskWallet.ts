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

import { HEX_HASH_TYPE, REQUIRED_PROPS } from '@purser/core/constants';
import {
  WalletType,
  WalletSubType,
  MessageVerificationObjectType,
  TransactionObjectTypeWithAddresses,
} from '@purser/core/types';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';
import { methodCaller, setStateEventObserver } from './helpers';
import { validateMetaMaskState } from './validators';
import { signMessage as signMessageMethodLink } from './methodLinks';

import { PUBLICKEY_RECOVERY_MESSAGE, STD_ERRORS } from './constants';
import {
  MetamaskWallet as messages,
  staticMethods as staticMethodsMessages,
} from './messages';

import {
  MetaMaskInpageProvider,
  MetamaskWalletConstructorArgumentsType,
  SignMessageObject,
} from './types';

export default class MetamaskWallet {
  private state;

  private internalPublicKey?: string;

  address: string;

  readonly type: WalletType = WalletType.Software;

  readonly subtype: WalletSubType = WalletSubType.MetaMask;

  constructor({ address }: MetamaskWalletConstructorArgumentsType) {
    /*
     * Validate the address that's coming in from Metamask
     */
    addressValidator(address);
    this.address = address;
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
          (newState: MetaMaskInpageProvider): boolean => {
            try {
              /*
               * Validate the state object that's coming in.
               * It should have all the props needed for us to work with.
               *
               * If they aren't there, it means that either Metamask is locked,
               * or somebody tampered with them.
               */
              validateMetaMaskState(newState);
              /*
               * We only update the values if the state has changed.
               * (We're using lodash here to deep compare the two state objects)
               */
              if (!isEqual(this.state, newState)) {
                this.state = newState;
                this.address = newState.selectedAddress;
                /*
                 * Reset the saved public key, as the address now changed
                 */
                this.internalPublicKey = undefined;
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
  getPublicKey(): Promise<string> {
    /*
     * We can't memoize the getter (as we do in most other such getters)
     *
     * This is because the address could change at any time leaving us with a
     * stale value for the public key, as there is no way (currently) to invalidate
     * this value.
     */
    if (this.internalPublicKey) {
      return Promise.resolve(this.internalPublicKey);
    }
    return this.recoverPublicKey(this.address);
  }

  async sign(
    transactionObject: TransactionObjectTypeWithAddresses,
  ): Promise<string | void> {
    /*
     * Validate the trasaction's object input
     */
    userInputValidator({
      firstArgument: transactionObject,
    });
    return signTransaction({ ...transactionObject, from: this.address });
  }

  async signMessage(messageObject: SignMessageObject): Promise<string | void> {
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
  }

  async verifyMessage(
    messageVerificationObject: MessageVerificationObjectType,
  ): Promise<boolean> {
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
  async recoverPublicKey(currentAddress: string): Promise<string> {
    /*
     * We must check for the Metamask injected in-page proxy every time we
     * try to access it. This is because something can change it from the time
     * of last detection until now.
     */
    return methodCaller<Promise<string>>(
      /*
       * @TODO Move into own (non-anonymous) method
       * This way we could better test it
       */
      () =>
        new Promise((resolve, reject) => {
          /*
           * Sign the message. This will prompt the user via Metamask's UI
           */
          signMessageMethodLink(
            /*
             * Ensure the hex string has the `0x` prefix
             */
            hexSequenceNormalizer(
              Buffer.from(PUBLICKEY_RECOVERY_MESSAGE).toString(HEX_HASH_TYPE),
            ),
            currentAddress,
            /*
             * @TODO Move into own (non-anonymous) method
             * This way we could better test it
             */
            (error: Error, signature: string) => {
              if (error) {
                /*
                 * Don't throw an Error if the user just cancels signing the message.
                 * This is normal UX, not an exception
                 */
                if (error.message.includes(STD_ERRORS.CANCEL_MSG_SIGN)) {
                  warning(staticMethodsMessages.cancelMessageSign);
                  return resolve(STD_ERRORS.CANCEL_MSG_SIGN);
                }
                return reject(error);
              }
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
                this.internalPublicKey = normalizedPublicKey;
                return resolve(normalizedPublicKey);
              } catch (caughtError) {
                return reject(caughtError);
              }
            },
          );
        }),
      messages.cannotGetPublicKey,
    );
  }
}
