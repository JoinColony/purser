/* @flow */

import { Wallet as EtherWallet, HDNode } from 'ethers/wallet';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import type {
  ProviderType,
  WalletType,
  WalletArgumentsType,
  SoftwareWalletExportType,
} from './flowtypes';

import { autoselect } from './providers';
import { getRandomValues, warn, error } from './utils';
import { warnings, errors } from './messages';
import {
  ENV,
  CLASS_GETTER,
  QR_CODE_OPTS,
  BLOCKIE_OPTS,
  WALLET_PROP,
  MNEMONIC_PATH,
} from './defaults';

/*
 * "Private" variables
 */
let encryptionPassword: string | void;
/**
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @extends EtherWallet
 */
class SoftwareWallet extends EtherWallet {
  constructor(
    privateKey: string,
    provider: ProviderType | void,
    password: string | void,
  ) {
    /*
     * @TODO Check for similar prop names
     * Eg: paSword vs. paSSword vs. passWRD, maybe find a fuzzy search lib
     * Alternatively take a look at React's code base and see how they've
     * implemented this.
     */
    super(privateKey, typeof provider === 'function' ? provider() : provider);
    encryptionPassword = password;
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
        Object.assign(
          {},
          { value: this.encrypt(encryptionPassword) },
          CLASS_GETTER,
        ),
      );
      return this.encrypt(encryptionPassword);
    }
    return new Promise((resolve, reject) => reject()).catch(() =>
      warn(warnings.softwareWallet.Class.noPassword),
    );
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
   * Address QR Code
   */
  addressQR: string;
  get addressQR(): Promise<string | void> {
    if (this.address) {
      /*
       * While this is not a particularly expensive operation (it is, but it's
       * small potatoes compared to the others), it's still a good approach
       * to memoize the getter, so we're doing that here as well.
       */
      Object.defineProperty(
        this,
        /*
         * Flow also doesn't like getter-only props
         */
        /* $FlowFixMe */
        'addressQR',
        Object.assign({}, CLASS_GETTER, {
          value: qrcode.toDataURL(this.address, QR_CODE_OPTS),
        }),
      );
      return qrcode.toDataURL(this.address, QR_CODE_OPTS);
    }
    return new Promise((resolve, reject) => reject()).catch(() =>
      error(errors.softwareWallet.Class.noAddress, this.address),
    );
  }
  /*
   * Address Identicon (Blockie)
   */
  blockie: string;
  get blockie(): Promise<string | void> {
    if (this.address) {
      const blockiePromise = new Promise(resolve => {
        const blockie = blockies.create(
          Object.assign({}, BLOCKIE_OPTS, { seed: this.address }),
        );
        resolve(blockie.toDataURL());
      });
      /*
       * While this is not a particularly expensive operation (it is, but it's
       * small potatoes compared to the others), it's still a good approach
       * to memoize the getter, so we're doing that here as well.
       */
      Object.defineProperty(
        this,
        /*
         * Flow also doesn't like getter-only props
         */
        /* $FlowFixMe */
        'blockie',
        Object.assign({}, CLASS_GETTER, { value: blockiePromise }),
      );
      return blockiePromise;
    }
    return new Promise((resolve, reject) => reject()).catch(() =>
      error(errors.softwareWallet.Class.noAddress, this.address),
    );
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
        this,
        /*
         * Flow also doesn't like getter-only props
         */
        /* $FlowFixMe */
        'privateKeyQR',
        Object.assign({}, CLASS_GETTER, {
          value: qrcode.toDataURL(this.privateKey, QR_CODE_OPTS),
        }),
      );
      return qrcode.toDataURL(this.privateKey, QR_CODE_OPTS);
    }
    return new Promise((resolve, reject) => reject()).catch(() =>
      error(errors.softwareWallet.Class.noPrivateKey, this.privateKey),
    );
  }
  /**
   * Create a new wallet.
   *
   * This will use EtherWallet's `createRandom()` (with defaults and entrophy)
   * and use the resulting private key to instantiate a new SoftwareWallet.
   *
   * @method create
   *
   * @param {ProviderType} provider An available provider to add to the wallet
   * @param {Uint8Array} entrophy An unsigned 8bit integer Array to provide extra randomness
   * @param {string} password Optional password used to generate an encrypted keystore
   *
   * All the above params are sent in as props of an {WalletArgumentsType} object.
   *
   * @return {WalletType} A new wallet object
   */
  static create({
    provider = autoselect(),
    password,
    entrophy = new Uint8Array(65536),
  }: WalletArgumentsType): () => WalletType {
    let basicWallet: WalletType;
    let walletInstance: () => WalletType;
    try {
      if (!entrophy || (entrophy && !(entrophy instanceof Uint8Array))) {
        warn(warnings.softwareWallet.Class.noEntrophy);
        basicWallet = this.createRandom();
      } else {
        basicWallet = this.createRandom({
          extraEntrophy: getRandomValues(entrophy),
        });
      }
      /*
       * @TODO Refactor this for less code repetition
       */
      if (typeof provider === 'object' || typeof provider === 'function') {
        walletInstance = new this(basicWallet.privateKey, provider, password);
      } else {
        warn(warnings.softwareWallet.Class.noProvider);
        walletInstance = new this(basicWallet.privateKey, undefined, password);
      }
      /*
       * @TODO Refactor this into the Class contructor
       * So we don't ending up needing to set it up on both open and create
       *
       * Re-set `mnemonic` and `path` on the Wallet Instance Object
       * Not doing so will loose the two props, since a new Wallet instance
       * only returns the `privateKey` prop.
       */
      Object.defineProperty(
        walletInstance,
        'mnemonic',
        Object.assign({}, WALLET_PROP, { value: basicWallet.mnemonic }),
      );
      Object.defineProperty(
        walletInstance,
        'path',
        Object.assign({}, WALLET_PROP, { value: basicWallet.path }),
      );
      return walletInstance;
    } catch (err) {
      error(errors.softwareWallet.Class.create, provider, entrophy, err);
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
   * @param {ProviderType} provider An available provider to add to the wallet
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
  static open(walletArguments: WalletArgumentsType): (() => WalletType) | void {
    /*
     * We can't destructure the arguments in the function signature, since we
     * need to iterate through them in case of an error.
     */
    const {
      provider = autoselect(),
      password,
      privateKey,
      mnemonic,
      path = MNEMONIC_PATH,
    } = walletArguments;
    try {
      let extractedPrivateKey: string = '';
      if (mnemonic && HDNode.isValidMnemonic(mnemonic)) {
        extractedPrivateKey = HDNode.fromMnemonic(mnemonic).derivePath(path)
          .privateKey;
      }
      /*
       * @TODO Add open with keystore functionality
       * But because this relies on async data, we must either make the whole
       * `open()` method async or even the whole wallet library.
       */
      const walletInstance = new this(
        privateKey || extractedPrivateKey,
        provider,
        password,
      );
      /*
       * @TODO Refactor this into the Class contructor
       * So we don't ending up needing to set it up on both open and create
       *
       * Re-set `mnemonic` and `path` on the Wallet Instance Object
       * Not doing so will loose the two props, since a new Wallet instance
       * only returns the `privateKey` prop.
       */
      Object.defineProperty(
        walletInstance,
        'mnemonic',
        Object.assign({}, WALLET_PROP, { value: mnemonic }),
      );
      Object.defineProperty(
        walletInstance,
        'path',
        Object.assign({}, WALLET_PROP, { value: path }),
      );
      return walletInstance;
    } catch (err) {
      error(
        errors.softwareWallet.Class.open,
        Object.keys(walletArguments).reduce(
          (allArgs, key) =>
            `${allArgs}${key} (${String(walletArguments[key])}), `,
          '',
        ),
        err,
      );
    }
    return undefined;
  }
}

/*
 * We need to use `defineProperty` to make the prop enumerable.
 * When adding a `Class` getter/setter it will prevent that by default
 *
 * We're dealing with `defineProperty` so we need to quiet down Flow.
 * This is because Flow, and how it doesn't play well (at all, really...)
 * with getters and setters. See the bellow issue for more info.
 *
 * @FIXME Remove `Flow` error suppression when it gets fixed
 * See: https://github.com/facebook/flow/issues/285
 */
Object.defineProperty(
  SoftwareWallet.prototype,
  /* $FlowFixMe */
  'keystore',
  Object.assign({}, CLASS_GETTER),
);
Object.defineProperty(
  SoftwareWallet.prototype,
  /*
   * Flow also doesn't like getter-only props
   */
  /* $FlowFixMe */
  'addressQR',
  Object.assign({}, CLASS_GETTER),
);
Object.defineProperty(
  SoftwareWallet.prototype,
  /*
   * Flow also doesn't like getter-only props
   */
  /* $FlowFixMe */
  'blockie',
  Object.assign({}, CLASS_GETTER),
);
Object.defineProperty(
  SoftwareWallet.prototype,
  /*
   * Flow also doesn't like getter-only props
   */
  /* $FlowFixMe */
  'privateKeyQR',
  Object.assign({}, CLASS_GETTER),
);

/**
 * Create a new wallet.
 * This method is the one that's actually exposed outside the module.
 *
 * @TODO Add API documentation
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
): (() => WalletType) => SoftwareWallet.create(walletArguments);

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const softwareWallet: SoftwareWalletExportType = Object.assign(
  {},
  {
    create,
  },
  ENV === 'development' || ENV === 'test' ? { SoftwareWallet } : {},
);

export default softwareWallet;
