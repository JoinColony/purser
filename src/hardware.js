/* @flow */

import trezorWallet from './trezor';

import type { WalletExportType } from './flowtypes';

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const hardwareWallet: { trezor: WalletExportType } = Object.assign(
  {},
  {
    trezor: trezorWallet,
  },
);

export default hardwareWallet;
