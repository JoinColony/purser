/* @flow */

import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import utils from './utils';

import * as trezorValidators from './trezor/validators';
import * as trezorNormalizers from './trezor/normalizers';

import { software } from './wallets';
import TrezorWallet from './trezor/class';

const { SoftwareWallet } = software;

/*
 * This object was extracted in it's own export to not pollute the index,
 * as this in only available when building in `development` mode.
 */
const debug: Object = {
  debug: {
    ethers,
    qrcode,
    blockies,
    utils,
    validators: trezorValidators,
    normalizers: trezorNormalizers,
    walletClasses: {
      SoftwareWallet,
      TrezorWallet,
    },
  },
};

export default debug;
