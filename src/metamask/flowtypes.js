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

export type MetamaskWalletConstructorArgumentsType = {
  address: string,
};

export type signMessageMethodType = (
  signature: string,
  currentAddress: string,
  (error: Error, result: string) => any,
) => void;
