/* @flow */

import trezorWallet from './trezor';

import type { HardwareWalletIndexExportType } from './flowtypes';

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const hardwareWallet: HardwareWalletIndexExportType = Object.assign(
  {},
  {
    trezor: trezorWallet,
  },
);

export default hardwareWallet;
