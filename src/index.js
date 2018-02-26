/* @flow */

import ethers from 'ethers';

import providers from './providers';
import utils from './utils';
import { ENV } from './defaults';
import { name, version } from '../package.json';

const debug = {
  debug: {
    ethers,
  },
};

const colonyWallet = Object.assign(
  {},
  {
    utils,
    providers,
    about: {
      name,
      version,
      environment: ENV,
    },
  },
  ENV === 'development' ? debug : {},
);

export default colonyWallet;
