/* @flow */

import trezorWallet from './trezor';
import ledgerWallet from './ledger';

import type { WalletExportType } from './flowtypes';

const hardwareWallet: { trezor: WalletExportType } = Object.assign(
  {},
  {
    trezor: trezorWallet,
    ledger: ledgerWallet,
  },
);

export default hardwareWallet;
