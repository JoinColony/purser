/* @flow */

import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import type { DebugExportType } from './flowtypes';

import { software } from './wallets';

const { SoftwareWallet } = software;

/*
 * This object was extracted in it's own export to not pollute the index,
 * as this in only available when building in `development` mode.
 */
const debug: DebugExportType = {
  debug: {
    ethers,
    qrcode,
    blockies,
    SoftwareWallet,
  },
};

export default debug;
