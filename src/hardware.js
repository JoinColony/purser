/* @flow */

import { ENV } from './defaults';
import { open, create } from './trezor';
import _TrezorConnect from './_trezorConnectIIFE';

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const hardwareWallet: * = Object.assign(
  {},
  {
    trezor: {
      open,
      create,
    },
  },
  ENV === 'development' || ENV === 'test' ? { _TrezorConnect } : {},
);

export default hardwareWallet;
