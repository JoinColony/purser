/* @flow */

import trezorWallet from './trezor';

import type { WalletExportType } from './flowtypes';

const hardwareWallet: { trezor: WalletExportType } = Object.assign(
  {},
  {
    trezor: trezorWallet,
  },
);

export default hardwareWallet;
