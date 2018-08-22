/* @flow */

import { HDNode } from 'ethers/wallet';

import { derivationPathSerializer } from '../core/helpers';
import { objectToErrorString } from '../core/utils';
import SoftwareWallet, { create } from './software';

import { PATH } from '../core/defaults';
import { classMessages as messages } from './messages';

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
     * @method open
     *
     * @param {string} password Optional password used to generate an encrypted keystore
     * @param {string} privateKey Optional (in case you pass another type)
     * @param {string} mnemonic Optional (in case you pass another type)
     *
     * All the above params are sent in as props of an {WalletArgumentsType} object.
     *
     * @return {WalletType} A new wallet object (or undefined) if somehwere along
     * the line an error is thrown.
     */
    open: async ({
      password,
      privateKey,
      mnemonic,
      keystore,
    }: WalletArgumentsType = {}): Promise<WalletObjectType | void> => {
      let extractedPrivateKey: string;
      let extractedMnemonic: string;
      let extractedPath: string;
      /*
       * @TODO Re-add use ability to control derivation path
       * When opening the wallet. But only if this proves to be a needed
       * feature.
       */
      const derivationPath: string = derivationPathSerializer({
        change: PATH.CHANGE,
        addressIndex: PATH.INDEX,
      });
      try {
        /*
         * @TODO Detect if existing but not valid keystore, and warn the user
         */
        if (
          keystore &&
          SoftwareWallet.isEncryptedWallet(keystore) &&
          password
        ) {
          const keystoreWallet: Object =
            /*
             * Prettier suggests changes that would always result in eslint
             * breaking. This must be one of the edge cases of prettier.
             *
             * Nevertheless, by inserting this comment, it works :)
             */
            await SoftwareWallet.fromEncryptedWallet(keystore, password);
          extractedPrivateKey = keystoreWallet.privateKey;
          extractedMnemonic = keystoreWallet.mnemonic;
          extractedPath = keystoreWallet.path;
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
        return new SoftwareWallet(
          privateKey || extractedPrivateKey,
          password,
          mnemonic || extractedMnemonic,
          derivationPath || extractedPath,
          keystore,
        );
      } catch (caughtError) {
        throw new Error(
          `${messages.open} ${objectToErrorString({
            password,
            privateKey,
            mnemonic,
            keystore,
            derivationPath,
          })} Error: ${caughtError.message}`,
        );
      }
    },
    create,
  },
);

export default softwareWallet;
