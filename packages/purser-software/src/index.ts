import { Wallet as EthersWallet } from 'ethers/wallet';
import { isValidMnemonic, fromMnemonic } from 'ethers/utils/hdnode';
import { isSecretStorageWallet } from 'ethers/utils/json-wallet';

import {
  CHAIN_IDS,
  derivationPathSerializer,
  getRandomValues,
  objectToErrorString,
  PATH,
  userInputValidator,
  warning,
  WalletArgumentsType,
} from '@purser/core';

import SoftwareWallet from './SoftwareWallet';
import { REQUIRED_PROPS as REQUIRED_PROPS_SOFTWARE } from './constants';
import { staticMethods as messages } from './messages';

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
 * @param {string} privateKey Private key to open the wallet with
 * @param {string} mnemonic Mnemonic string to open the wallet with
 * @param {string} keystore JSON formatted keystore string to open the wallet with.
 * Only works if you also send in a password
 * @param {number} chainId The id of the network to use, defaults to mainnet (1)
 *
 * All the above params are sent in as props of an {WalletArgumentsType} object.
 *
 * @return {WalletType} A new wallet object (or undefined) if somehwere along
 * the line an error is thrown.
 */

export const open = async (
  argumentObject: WalletArgumentsType = {},
): Promise<SoftwareWallet | void> => {
  /*
   * Validate the trasaction's object input
   */
  userInputValidator({
    firstArgument: argumentObject,
    requiredEither: REQUIRED_PROPS_SOFTWARE.OPEN_WALLET,
  });
  const {
    password,
    privateKey,
    mnemonic,
    keystore,
    chainId = CHAIN_IDS.HOMESTEAD,
  } = argumentObject;
  let extractedPrivateKey: string;
  /*
   * @TODO Re-add use ability to control derivation path
   * When opening the wallet. But only if this proves to be a needed feature.
   */
  const derivationPath: string = derivationPathSerializer({
    change: PATH.CHANGE,
    addressIndex: PATH.INDEX,
  });
  try {
    /*
     * @TODO Detect if existing but not valid keystore, and warn the user
     */
    if (keystore && isSecretStorageWallet(keystore) && password) {
      const keystoreWallet = await EthersWallet.fromEncryptedJson(
        keystore,
        password,
      );
      return new SoftwareWallet(keystoreWallet, { chainId });
    }
    /*
     * @TODO Detect if existing but not valid mnemonic, and warn the user
     */
    if (mnemonic && isValidMnemonic(mnemonic)) {
      const mnemonicWallet = fromMnemonic(mnemonic).derivePath(derivationPath);
      extractedPrivateKey = mnemonicWallet.privateKey;
    }
    /*
     * @TODO Detect if existing but not valid private key, and warn the user
     */
    const privateKeyWallet = new EthersWallet(
      privateKey || extractedPrivateKey,
    );

    return new SoftwareWallet(privateKeyWallet, { chainId });
  } catch (caughtError) {
    throw new Error(
      `${messages.open} ${objectToErrorString({
        privateKey,
        mnemonic,
        keystore,
      })} Error: ${caughtError.message}`,
    );
  }
};

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
 * @param {number} chainId The id of the network to use, defaults to mainnet (1)
 *
 * All the above params are sent in as props of an {WalletArgumentsType} object.
 *
 * @return {WalletType} A new wallet object
 */
export const create = async (
  argumentObject: WalletArgumentsType = {},
): Promise<SoftwareWallet | void> => {
  /*
   * Validate the trasaction's object input
   */
  userInputValidator({
    firstArgument: argumentObject,
  });
  const {
    entropy = getRandomValues(new Uint8Array(65536)),
    chainId = CHAIN_IDS.HOMESTEAD,
  } = argumentObject;
  let basicWallet: EthersWallet;
  try {
    if (!entropy || (entropy && !(entropy instanceof Uint8Array))) {
      warning(messages.noEntropy);
      basicWallet = EthersWallet.createRandom();
    } else {
      basicWallet = EthersWallet.createRandom({
        extraEntropy: entropy,
      });
    }
    return new SoftwareWallet(basicWallet, { chainId });
  } catch (caughtError) {
    throw new Error(`${messages.create} Error: ${caughtError.message}`);
  }
};
