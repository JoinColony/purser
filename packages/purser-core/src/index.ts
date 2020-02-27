import * as helpers from './helpers';
import * as validators from './validators';
import * as normalizers from './normalizers';
import * as defaults from './defaults';
import * as messages from './messages';
import * as types from './types';
import * as utils from './utils';
import GenericWallet from './GenericWallet';

const coreModule = {
  helpers,
  defaults,
  validators,
  normalizers,
  messages,
  types,
  utils,
  GenericWallet,
};

export {
  helpers,
  defaults,
  validators,
  normalizers,
  messages,
  types,
  utils,
  GenericWallet,
};

export default coreModule;
