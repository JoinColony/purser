/* @flow */

import U2fTransport from '@ledgerhq/hw-transport-u2f';
import LedgerHwAppETH from '@ledgerhq/hw-app-eth';

import LedgerWallet from './class';

import { derivationPathSerializer } from '../core/helpers';
import { warning } from '../core/utils';
import { autoselect } from '../providers';

import { deprecated as deprecatedMessages } from '../core/messages';
import { staticMethods as messages } from './messages';
import { PATH } from '../core/defaults';
import { MAIN_NETWORK } from '../defaults';

import type { WalletArgumentsType } from '../core/flowtypes';

const ledgerWallet: Object = Object.assign(
  {},
  {
    /**
     * Open a new wallet from the public key and chain code, which are received
     * form the Ledger device (after unlocking it and entering the ethereum app)
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
      provider = autoselect,
    }: WalletArgumentsType = {}): Promise<LedgerWallet | void> => {
      const { COIN_MAINNET, COIN_TESTNET } = PATH;
      const transport = await U2fTransport.create();
      const ethAppConnection = new LedgerHwAppETH(transport);
      /*
       * Get the provider.
       * If it's a provider generator, execute the function and get it's return
       */
      let providerMode =
        typeof provider === 'function' ? await provider() : provider;
      let coinType: number = COIN_MAINNET;
      if (typeof provider !== 'object' && typeof provider !== 'function') {
        providerMode = undefined;
      } else {
        warning(deprecatedMessages.providers);
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
       * Get to root derivation path based on the coin type.
       *
       * Based on this, we will then derive all the needed address indexes
       * (inside the class constructor)
       */
      const rootDerivationPath: string = derivationPathSerializer({
        coinType,
      });
      /*
       * We need to catch the cancelled error since it's part of a normal user workflow
       */
      try {
        /*
         * Get the harware wallet's root public key and chain code, to use
         * for deriving the rest of the accounts
         */
        const { publicKey, chainCode } = await ethAppConnection.getAddress(
          /*
           * @NOTE Ledger requires a derivation path containing only the account value
           * No change and index
           *
           * If you want to prompt the user on the device, set the second argument
           * as true.
           */
          rootDerivationPath,
          false,
          true,
        );
        const walletInstance: LedgerWallet = new LedgerWallet({
          publicKey,
          chainCode,
          /*
           * Since we need to strip out the change values when opening the Ledger
           * wallet, we need to remove the post-pending slash. This way, the final
           * derivation path gets concatenated correctly.
           *
           * The only alternative would be to re-generate the derivation path inside
           * the class's constructor, but that would mean extra computational resources.
           */
          rootDerivationPath: `${rootDerivationPath.slice(0, -1)}`,
          addressCount,
          provider: providerMode,
        });
        return walletInstance;
      } catch (caughtError) {
        /*
         * But throw otherwise, so we can see what's going on
         */
        throw new Error(
          `${messages.userExportGenericError}: ${rootDerivationPath} ${
            caughtError.message
          }`,
        );
      }
    },
  },
);

export default ledgerWallet;
