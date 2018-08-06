/* @flow */

export type ProviderType = {
  apiAccessToken?: string,
  apiKey?: string,
  baseUrl?: string,
  chainId?: number,
  ensAddress?: string,
  name?: string,
  polling?: boolean,
  resetEventsBlock?: (blockNumber: number) => void,
  testnet?: boolean,
  url?: string,
  _events?: Object,
  _web3Provider?: Object,
};

export type AsyncProviderType = Promise<ProviderType | void>;

export type AsyncProviderGeneratorType = (...*) => AsyncProviderType;

export type ProviderArgumentsType = {
  network?: string,
  apiKey?: string,
  url?: string,
};
