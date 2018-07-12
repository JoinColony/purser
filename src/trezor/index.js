/* @flow */

import { fromString } from 'bip32-path';

import TrezorWallet from './class';

import { payloadListener, derivationPathSerializer } from './helpers';
import { autoselect } from '../providers';
import { warning, objectToErrorString } from '../utils';

import { staticMethodsMessages as messages } from './messages';
import { PATH, STD_ERRORS } from './defaults';
import { PAYLOAD_XPUB } from './payloads';
import { MAIN_NETWORK } from '../defaults';

import type {
  WalletArgumentsType,
  WalletObjectType,
  WalletExportType,
} from '../flowtypes';

const trezorWallet: WalletExportType = Object.assign(
  {},
  {
    /**
     * Open a new wallet from the public key and chain code, which are received
     * form the Trezor service after interacting (confirming) with the hardware
     * in real life.
     *
     * @method open
     *
     * @param {number} addressCount the number of extra addresses to generate from the derivation path
     * @param {ProviderType} provider An available provider to add to the wallet
     *
     * The above param is sent in as a prop of an {WalletArgumentsType} object.
     *
     * @return {WalletType} The wallet object resulted by instantiating the class
     * (Object is wrapped in a promise).
     *
     */
    open: async ({
      addressCount,
      /*
       * @TODO Add provider deptrecation warning
       *
       * As we have roadmapped to separate providers from the actual wallet
       */
      provider = autoselect,
    }: WalletArgumentsType = {}): Promise<WalletObjectType | void> => {
      const { COIN_MAINNET, COIN_TESTNET } = PATH;
      /*
       * Get the provider.
       * If it's a provider generator, execute the function and get it's return
       */
      let providerMode =
        typeof provider === 'function' ? await provider() : provider;
      let coinType = COIN_MAINNET;
      if (typeof provider !== 'object' && typeof provider !== 'function') {
        /*
         * @TODO Add no provider set warning message
         */
        warning('No provider set');
        providerMode = undefined;
      }
      /*
       * If we're on a testnet set the coin type id to `1`
       * This will be used in the derivation path
       */
      if (
        providerMode &&
        (!!providerMode.testnet || providerMode.name !== MAIN_NETWORK)
      ) {
        coinType = COIN_TESTNET;
      }
      /*
       * Modify the default payload to overwrite the path with the new
       * coid type id derivation
       */
      const modifiedPayloadObject: Object = Object.assign({}, PAYLOAD_XPUB, {
        path: fromString(
          derivationPathSerializer({ coinType }),
          true,
        ).toPathArray(),
      });
      /*
       * We need to catch the cancelled error since it's part of a normal user workflow
       */
      try {
        /*
         * Get the harware wallet's public key and chain code, to use for deriving
         * the rest of the accounts
         */
        const { publicKey, chainCode } = await payloadListener({
          payload: modifiedPayloadObject,
        });
        const walletInstance: WalletObjectType = new TrezorWallet(
          publicKey,
          chainCode,
          coinType,
          addressCount,
          providerMode,
        );
        return walletInstance;
      } catch (caughtError) {
        /*
         * Don't throw an error if the user cancelled
         */
        if (caughtError.message === STD_ERRORS.CANCEL_ACC_EXPORT) {
          return warning(messages.userExportCancel);
        }
        /*
         * But throw otherwise, so we can see what's going on
         */
        throw new Error(
          `${messages.userExportGenericError}: ${objectToErrorString(
            modifiedPayloadObject,
          )} ${caughtError.message}`,
        );
      }
    },
  },
);

export default trezorWallet;
