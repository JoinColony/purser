/* @flow */

import secretStorage from 'ethers/wallet/secret-storage';

import { derivationPathSerializer } from '../core/helpers';
import { PATH, DESCRIPTORS } from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_ETHERS } from '../core/types';

import { walletClass as messages } from './messages';

import { warning } from '../core/utils';

const { GETTERS, WALLET_PROPS } = DESCRIPTORS;
/*
 * "Private" variable(s)
 */
let encryptionPassword: string | void;
let keystoreJson: string | void;
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
 *
 * @TODO Fix Unit tests
 * After the `open` and `create` Methods were extracted
 * And after we're no longer extending the Ethers Wallet class
 *
 */
export default class SoftwareWallet {
  privateKey: string;

  mnemonic: string;

  derivationPath: string;

  /*
   * Encrypted JSON Keystore
   */
  keystore: string;

  type: string;

  subtype: string;

  constructor({ privateKey, password, mnemonic, keystore }: Object) {
    try {
      encryptionPassword = password;
      keystoreJson = keystore;
      /*
       * We're using `defineProperties` instead of strait up assignment, so that
       * we can customize the prop's descriptors
       */
      Object.defineProperties(this, {
        privateKey: Object.assign({}, { value: privateKey }, WALLET_PROPS),
        derivationPath: Object.assign(
          {},
          {
            value: derivationPathSerializer({
              change: PATH.CHANGE,
              addressIndex: PATH.INDEX,
            }),
          },
          WALLET_PROPS,
        ),
        type: Object.assign({}, { value: TYPE_SOFTWARE }, WALLET_PROPS),
        subtype: Object.assign({}, { value: SUBTYPE_ETHERS }, WALLET_PROPS),
      });
      /*
       * Only set the `mnemonic` prop if it's available, so it won't show up
       * as being defined, but set to `undefined`
       */
      if (mnemonic) {
        Object.defineProperty(
          (this: any),
          'mnemonic',
          Object.assign({}, { value: mnemonic }, WALLET_PROPS),
        );
      }
    } catch (caughtError) {
      /*
       * @TODO Add proper error message
       */
      throw new Error(caughtError.message);
    }
  }

  get keystore(): Promise<string | void> {
    if (encryptionPassword) {
      /*
       * Memoizing the getter
       *
       * This is quite an expensive operation, so we're memoizing it that
       * on the next call (an the others after that) it won't re-calculate
       * the value again.
       */
      Object.defineProperty(
        this,
        'keystore',
        Object.assign({}, GETTERS, {
          value:
            (keystoreJson && Promise.resolve(keystoreJson)) ||
            /*
             * We're usign Ethers's direct secret storage encrypt method to generate
             * the keystore JSON string
             *
             * @TODO Validate the password
             * The password won't work if it's not a string, so it will be best if
             * we write a string validator for it
             */
            secretStorage.encrypt(
              this.privateKey,
              encryptionPassword.toString(),
            ),
        }),
      );
      return (
        (keystoreJson && Promise.resolve(keystoreJson)) ||
        /*
         * We're usign Ethers's direct secret storage encrypt method to generate
         * the keystore JSON string
         *
         * @TODO Validate the password
         * The password won't work if it's not a string, so it will be best if
         * we write a string validator for it
         */
        secretStorage.encrypt(this.privateKey, encryptionPassword.toString())
      );
    }
    warning(messages.noPassword);
    return Promise.reject();
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
    encryptionPassword = newEncryptionPassword;
  }
}

/*
 * We need to use `defineProperty` to make the prop enumerable.
 * When adding them via a `Class` getter/setter it will prevent this by default
 */
Object.defineProperty(
  (SoftwareWallet: any).prototype,
  'keystore',
  Object.assign({}, GETTERS),
);
