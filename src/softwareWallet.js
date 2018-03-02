/* @flow */

import { Wallet } from 'ethers';

import type {
  ProviderType,
  WalletType,
  WalletArgumentsType,
} from './flowtypes';

import { autoselect } from './providers';
import { ENV } from './defaults';
import { getRandomValues, warn, error } from './utils';
import { warnings, errors } from './messages';

/*
 * "Private" variables
 */
let encryptionPassword: string;
/**
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @extends Wallet
 *
 * @TODO Add address QR generator
 * @TODO Add privatekey QR generator
 * @TODO Add address blockie generator
 */
class SoftwareWallet extends Wallet {
  constructor(
    privateKey: string,
    provider: ProviderType = autoselect(),
    password: string,
  ) {
    super(privateKey, provider);
    encryptionPassword = password;
  }
  keystore: string;
  get keystore(): Promise<string | void> {
    if (encryptionPassword) {
      /*
       * Memoizing the getter, so next it won't re-calculate the value
       */
      Object.defineProperty(this, 'keystore', {
        value: this.encrypt(encryptionPassword),
        writable: false,
        enumerable: true,
        configurable: true,
      });
      return this.encrypt(encryptionPassword);
    }
    return new Promise((resolve, reject) => reject()).catch(() =>
      /*
       * @TODO Add decriptor message
       */
      warn('no password'),
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
   * @return {WalletType} A new wallet object
   */
  static create({
    provider = autoselect(),
    password = '',
    entrophy = getRandomValues(new Uint8Array(65536)),
  }: WalletArgumentsType): () => WalletType {
    let basicWallet: WalletType;
    try {
      if (!password) {
        /*
         * @TODO Add decriptor message
         */
        warn('no password');
      }
      if (!entrophy || (entrophy && !(entrophy instanceof Uint8Array))) {
        warn(warnings.softwareWallet.Class.noEntrophy);
        basicWallet = this.createRandom();
      } else {
        basicWallet = this.createRandom({ extraEntrophy: entrophy });
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
Object.defineProperty(SoftwareWallet.prototype, 'keystore', {
  enumerable: true,
});

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
      return new Wallet(privateKey);
    }
    return new Wallet(privateKey, provider);
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
const softwareWallet: Object = Object.assign(
  {},
  {
    create,
    openWithPrivateKey,
  },
  ENV === 'development' ? { SoftwareWallet } : {},
);

export default softwareWallet;
