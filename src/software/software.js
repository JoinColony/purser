/* @flow */

import { Wallet as EtherWallet } from 'ethers/wallet';

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
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @TODO Refactor software wallet have better control over the resulting wallet object
 *
 * @TODO Fix Unit tests
 * After the `open` and `create` Methods were extracted
 *
 * @extends EtherWallet
 */
export default class SoftwareWallet extends EtherWallet {
  /*
   * Encrypted JSON Keystore
   */
  keystore: string;

  constructor(
    privateKey: string | void,
    password: string | void,
    mnemonic: string | void,
    derivationPath: string | void = derivationPathSerializer({
      change: PATH.CHANGE,
      addressIndex: PATH.INDEX,
    }),
    keystore: string | void,
  ) {
    encryptionPassword = password;
    keystoreJson = keystore;
    /*
     * We don't use providers, so set it to undefined
     * (don't pass anything in, so it's automatically set to undefined).
     *
     * Sadly, we can't actually delete the provider prop since it's set to
     * `configurable: false` in the parent Class
     */
    super(privateKey);
    /*
     * We're using `defineProperties` instead of strait up assignment, so that
     * we can customize the prop's descriptors
     */
    Object.defineProperties(this, {
      mnemonic: Object.assign({}, { value: mnemonic }, WALLET_PROPS),
      derivationPath: Object.assign(
        {},
        { value: derivationPath },
        WALLET_PROPS,
      ),
      type: Object.assign({}, { value: TYPE_SOFTWARE }, WALLET_PROPS),
      subtype: Object.assign({}, { value: SUBTYPE_ETHERS }, WALLET_PROPS),
    });
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
            this.encrypt(encryptionPassword),
        }),
      );
      return (
        (keystoreJson && Promise.resolve(keystoreJson)) ||
        this.encrypt(encryptionPassword)
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
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties((SoftwareWallet: any).prototype, {
  keystore: GETTERS,
});
