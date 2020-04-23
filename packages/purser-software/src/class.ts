import { encrypt } from 'ethers/utils/secret-storage';
import { privateToPublic } from 'ethereumjs-util';

import {
  derivationPathSerializer,
  userInputValidator,
} from '@purser/core/helpers';
import { warning } from '@purser/core/utils';
import { hexSequenceNormalizer } from '@purser/core/normalizers';
import {
  addressValidator,
  hexSequenceValidator,
} from '@purser/core/validators';

import {
  PATH,
  DESCRIPTORS,
  HEX_HASH_TYPE,
  REQUIRED_PROPS,
} from '@purser/core/constants';

import {
  WalletType,
  WalletSubType,
  WalletArgumentsType,
  TransactionObjectTypeWithTo,
  SignMessageData,
  MessageVerificationObjectType,
} from '@purser/core/types';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';

import { walletClass as messages } from './messages';

const { GETTERS, WALLET_PROPS } = DESCRIPTORS;
/*
 * "Private" (internal) variable(s)
 */
let internalKeystoreJson: string | void;
let internalEncryptionPassword: string | void;
/**
 * @NOTE We're no longer directly extending the Ethers Wallet Class
 *
 * This is due to the fact that we need more control over the resulting Class
 * object (SoftwareWallet in this case).
 *
 * We're still shadowing the Ethers Wallet, meaning when opening or creating a new
 * wallet, we will first create a Ethers Wallet instance than pass that along
 * to the SoftwareWallet constructor.
 *
 * This way we don't have to deal with non-configurable or non-writable props,
 * or the providers being baked in.
 */
export default class SoftwareWallet {
  address: string;

  privateKey: Promise<string>;

  originalMnemonic: string;

  derivationPath: string;

  type: string;

  subtype: string;

  chainId: number;

  /*
   * @TODO Add specific Flow types
   *
   * For the three main wallet methods
   */
  sign: (...any) => Promise<string>;

  signMessage: (...any) => Promise<string>;

  verifyMessage: (...any) => Promise<string>;

  constructor(ethersInstance: WalletArgumentsType) {
    const {
      address,
      privateKey,
      password,
      originalMnemonic: mnemonic,
      keystore,
      chainId,
      sign: ethersSign,
      signMessage: ethersSignMessage,
    } = ethersInstance;
    /*
     * Validate the private key and address that's coming in from ethers.
     */
    addressValidator(address);
    hexSequenceValidator(privateKey);
    /*
     * If we have a keystore JSON string and encryption password, set them
     * to the internal variables.
     */
    internalEncryptionPassword = password;
    internalKeystoreJson = keystore;
    /*
     * Set the private key to a "internal" variable since we only allow
     * access to it through a getter and not directly via a prop.
     */
    Object.defineProperties(this, {
      address: { value: address, ...WALLET_PROPS },
      type: { value: WalletType.Software, ...WALLET_PROPS },
      subtype: { value: WalletSubType.Ethers, ...WALLET_PROPS },
      chainId: { value: chainId, ...WALLET_PROPS },
      /*
       * Getters
       */
      privateKey: { get: async () => privateKey, ...GETTERS },
      /*
       * @TODO Allow users control of the derivation path
       * When instantiating a new class instance. But this is only if the feature
       * turns out to be required.
       */
      derivationPath: {
        get: async () =>
          derivationPathSerializer({
            change: PATH.CHANGE,
            addressIndex: PATH.INDEX,
          }),
        ...GETTERS,
      },
      sign: {
        value: async (transactionObject: TransactionObjectTypeWithTo) => {
          /*
           * Validate the trasaction's object input
           */
          userInputValidator({
            firstArgument: transactionObject,
          });
          const { chainId: transactionChainId = this.chainId } =
            transactionObject || {};

          const callbackToUse: (transaction: any) => string = ethersSign.bind(
            ethersInstance,
          );

          return signTransaction({
            ...transactionObject,
            chainId: transactionChainId,
            /*
             * @NOTE We need to bind the whole ethers instance
             *
             * Since the `sign` will look for different methods inside the
             * class's prototype, and if it fails to find them, it will
             * crash
             */
            callback: callbackToUse,
          });
        },
        ...WALLET_PROPS,
      },
      signMessage: {
        value: async (messageObject: SignMessageData) => {
          /*
           * Validate the trasaction's object input
           */
          userInputValidator({
            firstArgument: messageObject,
            requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
          });
          return signMessage({
            message: messageObject.message,
            messageData: messageObject.messageData,
            /*
             * @NOTE We need to bind the whole ethers instance
             *
             * Since the `signMessage` will look for different methods inside the
             * class's prototype, and if it fails to find them, it will
             * crash
             */
            callback: ethersSignMessage.bind(ethersInstance),
          });
        },
        ...WALLET_PROPS,
      },
      verifyMessage: {
        value: async (
          signatureVerificationObject: MessageVerificationObjectType,
        ) => {
          /*
           * Validate the trasaction's object input
           */
          userInputValidator({
            firstArgument: signatureVerificationObject,
            requiredAll: REQUIRED_PROPS.VERIFY_MESSAGE,
          });
          const { message, signature } = signatureVerificationObject;
          return verifyMessage({
            address,
            message,
            signature,
          });
        },
        ...WALLET_PROPS,
      },
    });
    /*
     * Only set the `mnemonic` prop if it's available, so it won't show up
     * as being defined, but set to `undefined`
     */
    if (mnemonic) {
      Object.defineProperty(this, 'mnemonic', {
        get: async () => mnemonic,
        ...GETTERS,
      });
    }
  }

  get keystore(): Promise<string> {
    /*
     * We're wrapping the getter (returning actually) in a IIFE so we can
     * write it using a `async` pattern.
     */
    return (async () => {
      if (internalEncryptionPassword) {
        const privateKey: string = await this.privateKey;
        /*
         * Memoizing the getter
         *
         * This is quite an expensive operation, so we're memoizing it that
         * on the next call (an the others after that) it won't re-calculate
         * the value again.
         */
        Object.defineProperty(this, 'keystore', {
          ...GETTERS,
          value:
            (internalKeystoreJson && Promise.resolve(internalKeystoreJson)) ||
            /*
             * We're usign Ethers's direct secret storage encrypt method to generate
             * the keystore JSON string
             *
             * @TODO Validate the password
             *
             * The password won't work if it's not a string, so it will be best if
             * we write a string validator for it
             */
            encrypt(privateKey, internalEncryptionPassword.toString()),
        });
        return (
          (internalKeystoreJson && Promise.resolve(internalKeystoreJson)) ||
          /*
           * We're usign Ethers's direct secret storage encrypt method to generate
           * the keystore JSON string
           *
           * @TODO Validate the password
           *
           * The password won't work if it's not a string, so it will be best if
           * we write a string validator for it
           */
          encrypt(privateKey, internalEncryptionPassword.toString())
        );
      }
      warning(messages.noPassword);
      return Promise.reject();
    })();
  }

  /*
   * Just set the encryption password, we don't return anything from here,
   * hence we don't have a need for `this`.
   *
   * This is just an convenince to allow us to set the encryption password
   * after the wallet has be created / instantiated.
   */
  /* eslint-disable-next-line class-methods-use-this */
  // set keystore(newEncryptionPassword: string): void {
  //  internalEncryptionPassword = newEncryptionPassword;
  // }

  get publicKey(): Promise<string | void> {
    /*
     * We're wrapping the getter (returning actually) in a IIFE so we can
     * write it using a `async` pattern.
     */
    return (async () => {
      const privateKey: string = await this.privateKey;
      const privateKeyBuffer = Buffer.from(privateKey, HEX_HASH_TYPE);
      const reversedPublicKey: string = privateToPublic(
        privateKeyBuffer,
      ).toString(HEX_HASH_TYPE);
      /*
       * Validate the reversed public key
       */
      hexSequenceValidator(reversedPublicKey);
      /*
       * Then normalize it to ensure it has the `0x` prefix
       */
      const normalizedPublicKey: string = hexSequenceNormalizer(
        reversedPublicKey,
      );
      /*
       * Memoizing the getter
       *
       * While this is not an expensive operation, it's still a good idea
       * to memoize it so it returns a tiny bit faster.
       */
      Object.defineProperty(this, 'publicKey', {
        ...GETTERS,
        value: Promise.resolve(normalizedPublicKey),
      });
      return normalizedPublicKey;
    })();
  }
}

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties(SoftwareWallet.prototype, {
  publicKey: GETTERS,
  keystore: GETTERS,
});
