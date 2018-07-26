/* @flow */

import trezorWallet from './trezor';
import ledgerWallet from './ledger';

const hardwareWallet: { trezor: Object } = Object.assign(
  {},
  {
    trezor: trezorWallet,
    ledger: ledgerWallet,
  },
);

export default hardwareWallet;
