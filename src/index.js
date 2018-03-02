/* @flow */

import ethers from 'ethers';

import type { ColonyWalletExportType } from './flowtypes';

import wallet, { software } from './wallet';
import providers from './providers';

import utils from './utils';

import { ENV } from './defaults';
import { name, version } from '../package.json';

const debug = {
  debug: {
    ethers,
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
