/* @flow */

export type MetamaskInpageProviderType = {
  mux: Object,
  publicConfigStore: {
    _events: Object,
    _state: Object,
  },
  rpcEngine: Object,
};

export type MetamaskStateEventsObserverType = (state: Object) => any;
