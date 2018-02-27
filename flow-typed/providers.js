declare type ProviderType = {
  apiAccessToken?: string,
  apiKey?: string,
  baseUrl?: string,
  chainId: number,
  ensAddress: string,
  name: string,
  polling?: boolean,
  resetEventsBlock?: (blockNumber: number) => void,
  testnet: boolean,
  url: string,
  _events: {},
  _web3Provider?: {},
};

declare type ProviderGeneratorType = (...*) => ProviderType;
