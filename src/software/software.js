/* @flow */

import { Wallet as EtherWallet } from 'ethers/wallet';

import { derivationPathSerializer } from '../core/helpers';
import { PATH, DESCRIPTORS } from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_ETHERS } from '../core/types';
import type { WalletObjectType, WalletArgumentsType } from '../core/flowtypes';

import { classMessages as messages } from './messages';

import { getRandomValues, warning } from '../core/utils';

const { GETTERS, WALLET_PROPS } = DESCRIPTORS;
/*
 * "Private" variable(s)
 */
let encryptionPassword: string | void;
let keystoreJson: string | void;
/**
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @TODO Expose (enumerate) prototype methods (getTransactionCount, getBalance, ...)
 * @TODO Add Wallet Object documentation for the newly exposed methods
 * @TODO Add Wallet Object documentation for the `sign()` wallet method
 * @TODO Refactor software wallet have better control over the resulting wallet object
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
    path: string | void = derivationPathSerializer({
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
      path: Object.assign({}, { value: path }, WALLET_PROPS),
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

  /**
   * Create a new wallet.
   *
   * This will use EtherWallet's `createRandom()` (with defaults and entropy)
   * and use the resulting private key to instantiate a new SoftwareWallet.
   *
   * @method create
   *
   * @param {Uint8Array} entropy An unsigned 8bit integer Array to provide extra randomness
   * @param {string} password Optional password used to generate an encrypted keystore
   *
   * All the above params are sent in as props of an {WalletArgumentsType} object.
   *
   * @return {WalletType} A new wallet object
   */
  static async create(
    walletArguments: WalletArgumentsType,
  ): Promise<WalletObjectType> {
    const {
      password,
      entropy = getRandomValues(new Uint8Array(65536)),
    } = walletArguments;
    let basicWallet: WalletObjectType;
    try {
      if (!entropy || (entropy && !(entropy instanceof Uint8Array))) {
        warning(messages.noEntrophy);
        basicWallet = this.createRandom();
      } else {
        basicWallet = this.createRandom({
          extraEntropy: entropy,
        });
      }
      return new this(
        basicWallet.privateKey,
        password,
        basicWallet.mnemonic,
        basicWallet.path,
      );
    } catch (err) {
      warning(messages.create, entropy, err, { level: 'high' });
      return this.createRandom();
    }
  }
}

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties((SoftwareWallet: any).prototype, {
  keystore: GETTERS,
});

/**
 * Create a new wallet.
 * This method is the one that's actually exposed outside the module.
 *
 * @method create
 *
 * @param {WalletArgumentsType} walletArguments The wallet arguments object
 * This way you can pass in arguments in any order you'd like.
 * Details about it's types can be found inside `flowtypes`
 *
 * @return {WalletType} A new wallet object
 */
export const create = (
  walletArguments: WalletArgumentsType = {},
): Promise<WalletObjectType> => SoftwareWallet.create(walletArguments);
