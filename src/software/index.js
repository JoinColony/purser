/* @flow */

import { HDNode, Wallet as EthersWallet } from 'ethers/wallet';

import { derivationPathSerializer, userInputValidator } from '../core/helpers';
import { objectToErrorString, getRandomValues, warning } from '../core/utils';
import SoftwareWallet from './class';

import { PATH } from '../core/defaults';
import { REQUIRED_PROPS as REQUIRED_PROPS_SOFTWARE } from './defaults';
import { staticMethods as messages } from './messages';

import type { WalletObjectType, WalletArgumentsType } from '../core/flowtypes';

const softwareWallet: Object = Object.assign(
  {},
  {
    /**
     * Open an existing wallet
     * Using either `mnemonic`, `private key` or `encrypted keystore`
     *
     * This will try to extract the private key from a mnemonic (if available),
     * and create a new SoftwareWallet instance using whichever key is available.
     * (the on passed in or the one extracted from the mnemonic).
     *
     * @TODO Reduce code repetition
     *
     * With some clever refactoring we might be able to only call the SoftwareWallet
     * constructor a single time for all three methods of opening the wallet
     *
     * @method open
     *
     * @param {string} password Optional password used to generate an encrypted keystore
     * @param {string} privateKey Private key to open the wallet with
     * @param {string} mnemonic Mnemonic string to open the wallet with
     * @param {string} keystore JSON formatted keystore string to open the wallet with.
     * Only works if you also send in a password
     *
     * All the above params are sent in as props of an {WalletArgumentsType} object.
     *
     * @return {WalletType} A new wallet object (or undefined) if somehwere along
     * the line an error is thrown.
     */
    open: async (
      argumentObject: WalletArgumentsType = {},
    ): Promise<SoftwareWallet | void> => {
      /*
       * Validate the trasaction's object input
       */
      userInputValidator({
        firstArgument: argumentObject,
        requiredEither: REQUIRED_PROPS_SOFTWARE.OPEN_WALLET,
      });
      const { password, privateKey, mnemonic, keystore } = argumentObject;
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
        if (keystore && EthersWallet.isEncryptedWallet(keystore) && password) {
          const keystoreWallet: Object =
            /*
             * Prettier suggests changes that would always result in eslint
             * breaking. This must be one of the edge cases of prettier.
             *
             * Nevertheless, by inserting this comment, it works :)
             */
            await EthersWallet.fromEncryptedWallet(keystore, password);
          /*
           * Set the keystore and password props on the instance object.
           *
           * So that we can make use of them inside the SoftwareWallet
           * constructor, as the Ethers Wallet instance object will
           * be passed down.
           */
          keystoreWallet.keystore = keystore;
          keystoreWallet.password = password;
          return new SoftwareWallet(keystoreWallet);
        }
        /*
         * @TODO Detect if existing but not valid mnemonic, and warn the user
         */
        if (mnemonic && HDNode.isValidMnemonic(mnemonic)) {
          const mnemonicWallet: Object = HDNode.fromMnemonic(
            mnemonic,
          ).derivePath(derivationPath);
          extractedPrivateKey = mnemonicWallet.privateKey;
        }
        /*
         * @TODO Detect if existing but not valid private key, and warn the user
         */
        const privateKeyWallet = new EthersWallet(
          privateKey || extractedPrivateKey,
        );
        /*
         * Set the mnemonic and password props on the instance object.
         *
         * So that we can make use of them inside the SoftwareWallet
         * constructor, as the Ethers Wallet instance object will
         * be passed down.
         */
        privateKeyWallet.mnemonic = mnemonic;
        privateKeyWallet.password = password;
        return new SoftwareWallet(privateKeyWallet);
      } catch (caughtError) {
        throw new Error(
          `${messages.open} ${objectToErrorString({
            password,
            privateKey,
            mnemonic,
            keystore,
          })} Error: ${caughtError.message}`,
        );
      }
    },
    /**
     * Create a new wallet.
     *
     * This will use EtherWallet's `createRandom()` (with defaults and entropy)
     * and use the resulting private key to instantiate a new SoftwareWallet.
     *
     * @TODO Fix unit tests
     * After refactor
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
    create: async (
      argumentObject: WalletArgumentsType = {},
    ): Promise<SoftwareWallet | void> => {
      /*
       * Validate the trasaction's object input
       */
      userInputValidator({
        firstArgument: argumentObject,
      });
      const {
        password,
        entropy = getRandomValues(new Uint8Array(65536)),
      } = argumentObject;
      let basicWallet: WalletObjectType;
      try {
        if (!entropy || (entropy && !(entropy instanceof Uint8Array))) {
          warning(messages.noEntrophy);
          basicWallet = EthersWallet.createRandom();
        } else {
          basicWallet = EthersWallet.createRandom({
            extraEntropy: entropy,
          });
        }
        /*
         * Set the password prop on the instance object.
         *
         * So that we can make use of them inside the SoftwareWallet
         * constructor, as the Ethers Wallet instance object will
         * be passed down.
         */
        basicWallet.password = password;
        return new SoftwareWallet(basicWallet);
      } catch (caughtError) {
        throw new Error(`${messages.create} Error: ${caughtError.message}`);
      }
    },
  },
);

export default softwareWallet;
