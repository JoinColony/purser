/* @flow */

import TrezorWallet from './class';

import { warning } from '../utils';

import type { WalletExportType, WalletArgumentsType } from '../flowtypes';

const trezorWallet: WalletExportType = Object.assign(
  {},
  {
    /**
     * Open the hardware wallet by generating address from the derived public key
     *
     * @method open
     *
     * @return {WalletType} A new wallet object (wrapped in a promise), which is
     * derived from the given path. Path defaults to the first address path.
     */
    open: async (
      trezorWalletArguments: WalletArgumentsType = {},
    ): Promise<TrezorWallet> => TrezorWallet.open(trezorWalletArguments),
    /**
     * We can't actually create a new wallet address since this is a harware
     * one and comes pre-seeeded.
     *
     * For consistency with the rest of the library we keep this method. But
     * instead of creating a new wallet we just warn the user that we can't.
     *
     * @TODO Add message prop
     *
     * @method create
     */
    create: async () => warning('Cannot create a new wallet/address'),
  },
);

export default trezorWallet;
