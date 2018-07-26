/* @flow */

import helpers from './helpers';
import * as validators from './validators';
import * as defaults from './defaults';
import * as messages from './messages';
import * as types from './types';

const coreModule: Object = {
  helpers,
  defaults,
  validators,
  messages,
  types,
};

export default coreModule;
