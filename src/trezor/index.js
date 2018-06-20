/* @flow */
import { ENV } from '../defaults';
import { TrezorWallet, open, create } from './class';

/*
 * If we're in dev mode, also export the `TrezorWallet` class so it's available
 * to us directly for debugging.
 */
const trezorWallet = Object.assign(
  {},
  {
    create,
    open,
  },
  ENV === 'development' || ENV === 'test' ? { TrezorWallet } : {},
);

export default trezorWallet;
