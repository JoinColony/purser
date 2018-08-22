/* @flow */

import { Wallet as EtherWallet, HDNode } from 'ethers/wallet';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import { derivationPathSerializer } from '../core/helpers';
import { PATH, ENV, DESCRIPTORS } from '../core/defaults';
import { TYPE_SOFTWARE, SUBTYPE_ETHERS } from '../core/types';
import type { WalletObjectType, WalletArgumentsType } from '../core/flowtypes';

import { QR_CODE_OPTS, BLOCKIE_OPTS } from './defaults';
import { classMessages as messages } from './messages';

import { getRandomValues, warning, objectToErrorString } from '../core/utils';

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
class SoftwareWallet extends EtherWallet {
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
     * @TODO Check for similar prop names
     *
     * Eg: paSword vs. paSSword vs. passWRD, maybe find a fuzzy search lib
     * Alternatively take a look at React's code base and see how they've
     * implemented this.
     */
    /*
     * We don't use providers, so set it to undefined.
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

  /*
   * Encrypted JSON Keystore
   */
  keystore: string;

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

  /*
   * Address Identicon (Blockie)
   */
  blockie: string;

  get blockie(): Promise<string | void> {
    if (this.address) {
      const blockiePromise = Promise.resolve(
        blockies
          .create(Object.assign({}, BLOCKIE_OPTS, { seed: this.address }))
          .toDataURL(),
      );
      /*
       * While this is not a particularly expensive operation (it is, but it's
       * small potatoes compared to the others), it's still a good approach
       * to memoize the getter, so we're doing that here as well.
       */
      Object.defineProperty(
        (this: any),
        'blockie',
        Object.assign({}, GETTERS, { value: blockiePromise }),
      );
      return blockiePromise;
    }
    warning(messages.noAddress, this.address, { level: 'high' });
    return Promise.reject();
  }

  /*
   * Private Key QR Code
   */
  privateKeyQR: string;

  get privateKeyQR(): Promise<string | void> {
    if (this.privateKey) {
      /*
       * While this is not a particularly expensive operation (it is, but it's
       * small potatoes compared to the others), it's still a good approach
       * to memoize the getter, so we're doing that here as well.
       */
      Object.defineProperty(
        (this: any),
        'privateKeyQR',
        Object.assign({}, GETTERS, {
          value: qrcode.toDataURL(this.privateKey, QR_CODE_OPTS),
        }),
      );
      return qrcode.toDataURL(this.privateKey, QR_CODE_OPTS);
    }
    warning(messages.noPrivateKey, this.privateKey, { level: 'high' });
    return Promise.reject();
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

  /**
   * Open an existing wallet
   * Using either `mnemonic`, `private key` or `encrypted keystore`
   *
   * This will try to extract the private key from a mnemonic (if available),
   * and create a new SoftwareWallet instance using whichever key is available.
   * (the on passed in or the one extracted from the mnemonic).
   *
   * @method open
   *
   * @param {string} password Optional password used to generate an encrypted keystore
   * @param {string} privateKey Optional (in case you pass another type)
   * @param {string} mnemonic Optional (in case you pass another type)
   * @param {string} path Optional path for the mnemonic (set by default)
   *
   * All the above params are sent in as props of an {WalletArgumentsType} object.
   *
   * @return {WalletType} A new wallet object (or undefined) if somehwere along
   * the line an error is thrown.
   */
  static async open(
    walletArguments: WalletArgumentsType,
  ): Promise<WalletObjectType | void> {
    /*
     * We can't destructure the arguments in the function signature, since we
     * need to iterate through them in case of an error.
     */
    const {
      password,
      privateKey,
      mnemonic,
      keystore,
      path = derivationPathSerializer({
        change: PATH.CHANGE,
        addressIndex: PATH.INDEX,
      }),
    } = walletArguments;
    let extractedPrivateKey: string;
    let extractedMnemonic: string;
    let extractedPath: string;
    try {
      /*
       * @TODO Detect if existing but not valid keystore, and warn the user
       */
      if (keystore && this.isEncryptedWallet(keystore) && password) {
        const keystoreWallet: Object = await this.fromEncryptedWallet(
          keystore,
          password,
        );
        extractedPrivateKey = keystoreWallet.privateKey;
        extractedMnemonic = keystoreWallet.mnemonic;
        extractedPath = keystoreWallet.path;
      }
      /*
       * @TODO Detect if existing but not valid mnemonic, and warn the user
       */
      if (mnemonic && HDNode.isValidMnemonic(mnemonic)) {
        const mnemonicWallet: Object = HDNode.fromMnemonic(mnemonic).derivePath(
          path,
        );
        extractedPrivateKey = mnemonicWallet.privateKey;
      }
      /*
       * @TODO Detect if existing but not valid private key, and warn the user
       */
      return new this(
        privateKey || extractedPrivateKey,
        password,
        mnemonic || extractedMnemonic,
        path || extractedPath,
        keystore,
      );
    } catch (err) {
      warning(messages.open, objectToErrorString(walletArguments), err, {
        level: 'high',
      });
      throw new Error();
    }
  }
}

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties((SoftwareWallet: any).prototype, {
  keystore: GETTERS,
  addressQR: GETTERS,
  blockie: GETTERS,
  privateKeyQR: GETTERS,
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

/**
 * Open (instantiate) a wallet.
 * This method is the one that's actually exposed outside the module.
 *
 * @method open
 *
 * @param {WalletArgumentsType} walletArguments The wallet arguments object
 * This way you can pass in arguments in any order you'd like.
 * Details about it's types can be found inside `flowtypes`
 *
 * @return {WalletType} A new wallet object
 * Will return `undefined` if no suitable method for ooening it was found.
 */
export const open = (
  walletArguments: WalletArgumentsType = {},
): Promise<WalletObjectType | void> => SoftwareWallet.open(walletArguments);

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const softwareWallet: Object = Object.assign(
  {},
  {
    create,
    open,
  },
  ENV === 'development' || ENV === 'test' ? { SoftwareWallet } : {},
);

export default softwareWallet;
