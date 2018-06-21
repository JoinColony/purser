/* @flow */

import { Wallet as EtherWallet, HDNode } from 'ethers/wallet';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import type {
  ProviderType,
  WalletObjectType,
  WalletArgumentsType,
  SoftwareWalletExportType,
} from './flowtypes';

import { autoselect } from './providers';
import { getRandomValues, warning } from './utils';
import { softwareWallet as messages } from './messages';
import {
  ENV,
  GETTER_PROP_DESCRIPTORS,
  QR_CODE_OPTS,
  BLOCKIE_OPTS,
  WALLET_PROP_DESCRIPTORS,
  MNEMONIC_PATH,
} from './defaults';

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
 *
 * @extends EtherWallet
 */
class SoftwareWallet extends EtherWallet {
  constructor(
    privateKey: string | void,
    provider: ProviderType | void,
    password: string | void,
    mnemonic: string | void,
    path: string | void = MNEMONIC_PATH,
    keystore: string | void,
  ) {
    let providerMode = typeof provider === 'function' ? provider() : provider;
    encryptionPassword = password;
    keystoreJson = keystore;
    /*
     * @TODO Check for similar prop names
     *
     * Eg: paSword vs. paSSword vs. passWRD, maybe find a fuzzy search lib
     * Alternatively take a look at React's code base and see how they've
     * implemented this.
     */
    if (typeof provider !== 'object' && typeof provider !== 'function') {
      warning(messages.noProvider);
      providerMode = undefined;
    }
    super(privateKey, providerMode);

    /*
     * We're using `defineProperties` instead of strait up assignment, so that
     * we can customize the prop's descriptors
     */
    Object.defineProperties(this, {
      mnemonic: Object.assign({}, { value: mnemonic }, WALLET_PROP_DESCRIPTORS),
      path: Object.assign({}, { value: path }, WALLET_PROP_DESCRIPTORS),
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
        Object.assign({}, GETTER_PROP_DESCRIPTORS, {
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
        (this: any),
        'addressQR',
        Object.assign({}, GETTER_PROP_DESCRIPTORS, {
          value: qrcode.toDataURL(this.address, QR_CODE_OPTS),
        }),
      );
      return qrcode.toDataURL(this.address, QR_CODE_OPTS);
    }
    warning(messages.noAddress, this.address, { level: 'high' });
    return Promise.reject();
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
        Object.assign({}, GETTER_PROP_DESCRIPTORS, { value: blockiePromise }),
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
        Object.assign({}, GETTER_PROP_DESCRIPTORS, {
          value: qrcode.toDataURL(this.privateKey, QR_CODE_OPTS),
        }),
      );
      return qrcode.toDataURL(this.privateKey, QR_CODE_OPTS);
    }
    warning(messages.noPrivateKey, this.privateKey, { level: 'high' });
    return Promise.reject();
  }
  /**
   * Wrapper method for `sendTransaction()` that waits for confirmation before
   * sending the transaction.
   *
   * @TODO Replace `data` type with a Transaction Type
   *
   * @method sendWithConfirmation
   *
   * @param {object} data transaction object. Does not work with signed, "hex" transaction data.
   * @param {Promise|boolean} confirmation A boolean or a promise that returns a boolean.
   *
   * @return {Promise} the transactin promise (if it was sent), or a rejected promise if it failed
   * (failed either by proving wrong transaction data or by denying it)
   */
  async sendWithConfirmation(
    data: Object,
    confirmation: Promise<boolean> | boolean = false,
  ) {
    if (!data || typeof data !== 'object') {
      warning(messages.transactionData, data, { level: 'high' });
      return Promise.reject();
    }
    if (await confirmation) {
      return this.sendTransaction(data);
    }
    warning(messages.transactionConfirmationFail, [data]);
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
   * @param {ProviderType} provider An available provider to add to the wallet
   * @param {Uint8Array} entropy An unsigned 8bit integer Array to provide extra randomness
   * @param {string} password Optional password used to generate an encrypted keystore
   *
   * All the above params are sent in as props of an {WalletArgumentsType} object.
   *
   * @return {WalletType} A new wallet object
   */
  static async create({
    provider = autoselect(),
    password,
    entropy = new Uint8Array(65536),
  }: WalletArgumentsType): Promise<WalletObjectType> {
    let basicWallet: WalletObjectType;
    try {
      if (!entropy || (entropy && !(entropy instanceof Uint8Array))) {
        warning(messages.noentropy);
        basicWallet = this.createRandom();
      } else {
        basicWallet = this.createRandom({
          extraEntropy: getRandomValues(entropy),
        });
      }
      return new this(
        basicWallet.privateKey,
        await provider,
        password,
        basicWallet.mnemonic,
        basicWallet.path,
      );
    } catch (err) {
      warning(messages.create, await provider, entropy, err, { level: 'high' });
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
  static async open(
    walletArguments: WalletArgumentsType,
  ): Promise<WalletObjectType | void> {
    /*
     * We can't destructure the arguments in the function signature, since we
     * need to iterate through them in case of an error.
     */
    const {
      provider = autoselect(),
      password,
      privateKey,
      mnemonic,
      keystore,
      path = MNEMONIC_PATH,
    } = walletArguments;
    let extractedPrivateKey: string;
    let extractedMnemonic: string;
    let extractedPath: string;
    try {
      /*
       * @TODO Detect if existing but not valid keystore, and warn the user
       */
      if (keystore && this.isEncryptedWallet(keystore) && password) {
        const keystoreWallet: WalletObjectType = await this.fromEncryptedWallet(
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
        const mnemonicWallet: WalletObjectType = HDNode.fromMnemonic(
          mnemonic,
        ).derivePath(path);
        extractedPrivateKey = mnemonicWallet.privateKey;
      }
      /*
       * @TODO Detect if existing but not valid private key, and warn the user
       */
      return new this(
        privateKey || extractedPrivateKey,
        await provider,
        password,
        mnemonic || extractedMnemonic,
        path || extractedPath,
        keystore,
      );
    } catch (err) {
      warning(
        messages.open,
        Object.keys(walletArguments).reduce(
          (allArgs, key) =>
            `${allArgs}${key} (${String(walletArguments[key])}), `,
          '',
        ),
        err,
        { level: 'high' },
      );
      throw new Error();
    }
  }
}

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties((SoftwareWallet: any).prototype, {
  keystore: GETTER_PROP_DESCRIPTORS,
  addressQR: GETTER_PROP_DESCRIPTORS,
  blockie: GETTER_PROP_DESCRIPTORS,
  privateKeyQR: GETTER_PROP_DESCRIPTORS,
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
const softwareWallet: SoftwareWalletExportType = Object.assign(
  {},
  {
    create,
    open,
  },
  ENV === 'development' || ENV === 'test' ? { SoftwareWallet } : {},
);

export default softwareWallet;
