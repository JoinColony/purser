/* @flow */

import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import type { ColonyWalletExportType } from './flowtypes';

import wallet, { software } from './wallet';
import providers from './providers';

import utils from './utils';

import { ENV } from './defaults';
import { name, version } from '../package.json';

const debug = {
  debug: {
    ethers,
    qrcode,
    blockies,
    SoftwareWallet: software.SoftwareWallet,
  },
};

const colonyWallet: ColonyWalletExportType = Object.assign(
  {},
  {
    wallet,
    providers,
    utils,
    about: {
      name,
      version,
      environment: ENV,
    },
  },
  ENV === 'development' ? debug : {},
);

export default colonyWallet;
