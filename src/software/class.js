/* @flow */

import secretStorage from 'ethers/wallet/secret-storage';
import { privateToPublic } from 'ethereumjs-util';

import { derivationPathSerializer, userInputValidator } from '../core/helpers';
import { warning } from '../core/utils';
import { hexSequenceNormalizer } from '../core/normalizers';
import { addressValidator, hexSequenceValidator } from '../core/validators';

import { signTransaction, signMessage } from './staticMethods';

import {
  PATH,
  DESCRIPTORS,
  HEX_HASH_TYPE,
  REQUIRED_PROPS,
} from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_ETHERS } from '../core/types';
import { walletClass as messages } from './messages';

import type {
  WalletArgumentsType,
  TransactionObjectType,
  MessageObjectType,
} from '../core/flowtypes';

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

  privateKey: string;

  publicKey: string;

  mnemonic: string;

  derivationPath: string;

  /*
   * Encrypted JSON Keystore
   */
  keystore: string;

  type: string;

  subtype: string;

  chainId: number;

  /*
   * @TODO Add specific Flow types
   *
   * For the three main wallet methods
   */
  sign: (...*) => Promise<string>;

  signMessage: (...*) => Promise<string>;

  constructor({
    address,
    privateKey,
    password,
    mnemonic,
    keystore,
    chainId,
    sign: ethersSign,
    signMessage: ethersSignMessage,
  }: WalletArgumentsType = {}) {
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
      address: Object.assign({}, { value: address }, WALLET_PROPS),
      type: Object.assign({}, { value: TYPE_SOFTWARE }, WALLET_PROPS),
      subtype: Object.assign({}, { value: SUBTYPE_ETHERS }, WALLET_PROPS),
      chainId: Object.assign({}, { value: chainId }, WALLET_PROPS),
      /*
       * Getters
       */
      privateKey: Object.assign({}, { get: async () => privateKey }, GETTERS),
      /*
       * @TODO Allow users control of the derivation path
       * When instantiating a new class instance. But this is only if the feature
       * turns out to be required.
       */
      derivationPath: Object.assign(
        {},
        {
          get: async () =>
            derivationPathSerializer({
              change: PATH.CHANGE,
              addressIndex: PATH.INDEX,
            }),
        },
        GETTERS,
      ),
      sign: Object.assign(
        {},
        {
          value: async (transactionObject: TransactionObjectType) => {
            /*
             * Validate the trasaction's object input
             */
            userInputValidator({
              firstArgument: transactionObject,
              requiredAll: REQUIRED_PROPS.SIGN_TRANSACTION,
            });
            const { chainId: transactionChainId = this.chainId } =
              transactionObject || {};
            return signTransaction(
              Object.assign({}, transactionObject, {
                callback: ethersSign,
                chainId: transactionChainId,
              }),
            );
          },
        },
        WALLET_PROPS,
      ),
      /*
       * @TODO Add unit test
       *
       * To check for the availability of this method, and if it calls the
       * correct static method
       */
      signMessage: Object.assign(
        {},
        {
          value: async ({ message }: MessageObjectType = {}) =>
            signMessage({
              message,
              callback: ethersSignMessage,
            }),
        },
        WALLET_PROPS,
      ),
    });
    /*
     * Only set the `mnemonic` prop if it's available, so it won't show up
     * as being defined, but set to `undefined`
     */
    if (mnemonic) {
      Object.defineProperty(
        (this: any),
        'mnemonic',
        Object.assign({}, { get: async () => mnemonic }, GETTERS),
      );
    }
  }

  get keystore(): Promise<string | void> {
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
        Object.defineProperty(
          (this: any),
          'keystore',
          Object.assign({}, GETTERS, {
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
              secretStorage.encrypt(
                privateKey,
                internalEncryptionPassword.toString(),
              ),
          }),
        );
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
          secretStorage.encrypt(
            privateKey,
            internalEncryptionPassword.toString(),
          )
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
  set keystore(newEncryptionPassword: string): void {
    internalEncryptionPassword = newEncryptionPassword;
  }

  get publicKey(): Promise<string | void> {
    /*
     * We're wrapping the getter (returning actually) in a IIFE so we can
     * write it using a `async` pattern.
     */
    return (async () => {
      const privateKey: string = await this.privateKey;
      const reversedPublicKey: string = privateToPublic(privateKey).toString(
        HEX_HASH_TYPE,
      );
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
      Object.defineProperty(
        (this: any),
        'publicKey',
        Object.assign({}, GETTERS, {
          value: Promise.resolve(normalizedPublicKey),
        }),
      );
      return normalizedPublicKey;
    })();
  }
}

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties((SoftwareWallet: any).prototype, {
  publicKey: GETTERS,
  keystore: GETTERS,
});
