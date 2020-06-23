import isEqual from 'lodash.isequal';
import {
  addressValidator,
  HEX_HASH_TYPE,
  hexSequenceNormalizer,
  hexSequenceValidator,
  recoverPublicKey as recoverPublicKeyHelper,
  REQUIRED_PROPS,
  userInputValidator,
  transactionObjectValidator,
  WalletType,
  WalletSubType,
  warning,
} from '@purser/core';
import { Web3Provider } from 'ethers/providers';
import { bigNumberify } from 'ethers/utils';

import type {
  PurserWallet,
  VerifyMessageData,
  TransactionObjectTypeWithTo,
} from '@purser/core';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';
import { methodCaller, setStateEventObserver } from './helpers';
import { validateMetaMaskState } from './validators';

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

export default class MetamaskWallet implements PurserWallet {
  private state: MetaMaskInpageProvider;

  private internalPublicKey: string;

  private mmProvider: Web3Provider;

  address: string;

  chainId: number;

  readonly type: WalletType = WalletType.Software;

  readonly subtype: WalletSubType = WalletSubType.MetaMask;

  constructor({ address }: MetamaskWalletConstructorArgumentsType) {
    /*
     * Validate the address that's coming in from Metamask
     */
    addressValidator(address);
    this.address = address;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.mmProvider = new Web3Provider((global as any).ethereum);
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
        setStateEventObserver((newState: MetaMaskInpageProvider): boolean => {
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
        }),
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

  /**
   * Sign a transaction
   *
   * @param provider The ethers web3 provider
   * @param messageObject the message you want to sign
   *
   * This function will return just the hash instead of the
   * signed transaction as it was already sent off
   *
   * @return The signed message `hex` string (wrapped inside a `Promise`)
   */
  async sign(transactionObject: TransactionObjectTypeWithTo): Promise<string> {
    /*
     * Validate the trasaction's object input
     */
    userInputValidator({
      firstArgument: transactionObject,
    });
    const {
      inputData,
      gasLimit,
      gasPrice,
      value,
      ...tx
    } = transactionObjectValidator(transactionObject);
    const ethersTx = {
      data: hexSequenceNormalizer(inputData),
      gasLimit: bigNumberify(gasLimit.toString()),
      gasPrice: bigNumberify(gasPrice.toString()),
      value: bigNumberify(value.toString()),
      ...tx,
    };
    return signTransaction(this.mmProvider, ethersTx);
  }

  /**
   * Sign a message and return the signature. Useful for verifying identities.
   *
   * @param provider The ethers web3 provider
   * @param messageObject the message you want to sign
   *
   * @return The signed message `hex` string (wrapped inside a `Promise`)
   */
  async signMessage(messageObject: SignMessageObject): Promise<string> {
    /*
     * Validate the trasaction's object input
     */
    userInputValidator({
      firstArgument: messageObject,
      requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
    });
    return signMessage(this.mmProvider, {
      currentAddress: this.address,
      message: messageObject.message,
      messageData: messageObject.messageData,
    });
  }

  /**
   * Verify a signed message. Useful for verifying identity. (In conjunction with `signMessage`)
   *
   * @param message The message to verify if it was signed correctly
   * @param signature The message signature as a `hex` string (you usually get this via `signMessage`)
   * @param currentAddress The current selected address (in the UI)
   *
   * All the above params are sent in as props of an object.
   *
   * @return A boolean to indicate if the message/signature pair are valid (wrapped inside a `Promise`)
   */
  async verifyMessage(
    messageVerificationObject: VerifyMessageData,
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
   * @param currentAddress The current selected address.
   * Note the we don't need to validate this here since it comes from a trusted
   * source: the class constructor.
   *
   * @return The recovered public key (for the currently selected addresss)
   */
  async recoverPublicKey(currentAddress: string): Promise<string> {
    return methodCaller<Promise<string>>(async () => {
      /*
       * Sign the message. This will prompt the user via Metamask's UI
       */
      try {
        const signature = await this.signMessage(
          /*
           * Ensure the hex string has the `0x` prefix
           */
          {
            message: hexSequenceNormalizer(
              Buffer.from(PUBLICKEY_RECOVERY_MESSAGE).toString(HEX_HASH_TYPE),
            ),
            currentAddress,
            messageData: '',
          },
        );
        /*
         * Validate that the signature is in the correct format
         */
        hexSequenceValidator(signature);
        const recoveredPublicKey = recoverPublicKeyHelper({
          message: PUBLICKEY_RECOVERY_MESSAGE,
          signature,
        });
        /*
         * Add the `0x` prefix to the recovered public key
         */
        const normalizedPublicKey: string = hexSequenceNormalizer(
          recoveredPublicKey,
        );
        this.internalPublicKey = normalizedPublicKey;
        return normalizedPublicKey;
      } catch (error) {
        /*
         * Don't throw an Error if the user just cancels signing the message.
         * This is normal UX, not an exception
         */
        if (error.message.includes(STD_ERRORS.CANCEL_MSG_SIGN)) {
          warning(staticMethodsMessages.cancelMessageSign);
          return STD_ERRORS.CANCEL_MSG_SIGN;
        }
        throw error;
      }
    }, messages.cannotGetPublicKey);
  }
}
