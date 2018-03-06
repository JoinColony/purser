/* @flow */

import type { ColonyWalletExportType } from './flowtypes';

import wallet from './wallet';
import providers from './providers';
import utils from './utils';
import debug from './debug';

import { ENV } from './defaults';
import { name, version } from '../package.json';

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
