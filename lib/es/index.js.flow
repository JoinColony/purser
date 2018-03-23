/* @flow */

import type { ColonyWalletExportType } from './flowtypes';

import wallets from './wallets';
import providers from './providers';
import utils from './utils';
import debug from './debug';

import { ENV } from './defaults';
import { name, version } from '../package.json';

const colonyWallet: ColonyWalletExportType = Object.assign(
  {},
  {
    wallets,
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
