/* @flow */

import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

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
    walletClasses: {
      SoftwareWallet,
      TrezorWallet,
    },
  },
};

export default debug;
