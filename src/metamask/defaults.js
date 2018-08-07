/* @flow */

import { getInpageProvider } from './helpers';

import type { MetamaskInpageProviderType } from './flowtypes';

const {
  publicConfigStore: { _events: EVENTS, _state: STATE },
}: MetamaskInpageProviderType = getInpageProvider();

export const INPAGE_PROVIDER: Object = {
  EVENTS,
  STATE,
};

const metamaskDefaults: Object = {
  INPAGE_PROVIDER,
};

export default metamaskDefaults;
