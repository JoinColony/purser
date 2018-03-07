/* @flow */

import { Wallet as EtherWallet } from 'ethers/wallet';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import type {
  ProviderType,
  WalletType,
  WalletArgumentsType,
  SoftwareWalletExportType,
} from './flowtypes';

import { autoselect } from './providers';
import { ENV, CLASS_GETTER, QR_CODE_OPTS, BLOCKIE_OPTS } from './defaults';
import { getRandomValues, warn, error } from './utils';
import { warnings, errors } from './messages';

/*
 * "Private" variables
 */
let encryptionPassword: string;
/**
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @extends EtherWallet
 *
 * @TODO Add address QR generator
 * @TODO Add privatekey QR generator
 * @TODO Add address blockie generator
 */
class SoftwareWallet extends EtherWallet {
  constructor(
    privateKey: string,
    provider: ProviderType | void,
    password: string,
  ) {
    super(privateKey, provider);
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
   * This is a wrapper around `ethers` Wallet createRandom that sets defaults,
   * catches errrors and sets additional helper props
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
    password = '',
    entrophy = new Uint8Array(65536),
  }: WalletArgumentsType): () => WalletType {
    let basicWallet: WalletType;
    try {
      if (!entrophy || (entrophy && !(entrophy instanceof Uint8Array))) {
        warn(warnings.softwareWallet.Class.noEntrophy);
        basicWallet = this.createRandom();
      } else {
        basicWallet = this.createRandom({
          extraEntrophy: getRandomValues(entrophy),
        });
      }
      if (!provider || (provider && typeof provider !== 'object')) {
        warn(warnings.softwareWallet.Class.noProvider);
        return new this(basicWallet.privateKey, undefined, password);
      }
      return new this(basicWallet.privateKey, provider, password);
    } catch (err) {
      error(errors.softwareWallet.Class.create, provider, entrophy, err);
      return this.createRandom();
    }
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
/* $FlowFixMe */
Object.defineProperty(
  SoftwareWallet.prototype,
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

/**
 * Create a new instance of a wallet using the privatekey
 *
 * @TODO Add API documentation
 * @TODO Refactor method to use the new `SoftwareWallet` class
 *
 * @method openWithPrivateKey
 *
 * @param {string} privatekey The private key to instanciate the wallet (it will
 * be checked for validity)
 * @param {ProviderType} provider An available provider to add to the wallet
 *
 * @return {WalletType} A new instance of the wallet
 */
export const openWithPrivateKey = (
  privateKey: string,
  provider: ProviderType = autoselect(),
): ?WalletType => {
  try {
    if (!provider || (provider && typeof provider !== 'object')) {
      warn(warnings.softwareWallet.Class.noProvider);
      return new EtherWallet(privateKey);
    }
    return new EtherWallet(privateKey, provider);
  } catch (err) {
    return error(
      errors.softwareWallet.openWithPrivateKey.cannotOpenWallet,
      privateKey,
      provider,
      err,
    );
  }
};

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const softwareWallet: SoftwareWalletExportType = Object.assign(
  {},
  {
    create,
    openWithPrivateKey,
  },
  ENV === 'development' || ENV === 'test' ? { SoftwareWallet } : {},
);

export default softwareWallet;
