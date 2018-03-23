import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import { software } from './wallets';

var SoftwareWallet = software.SoftwareWallet;

/*
 * This object was extracted in it's own export to not pollute the index,
 * as this in only available when building in `development` mode.
 */

var debug = {
  debug: {
    ethers: ethers,
    qrcode: qrcode,
    blockies: blockies,
    SoftwareWallet: SoftwareWallet
  }
};

export default debug;