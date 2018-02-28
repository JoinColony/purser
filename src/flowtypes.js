/* @flow */

export type ProviderType = {
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

export type ProviderGeneratorType = (...*) => ProviderType;

export type WalletType = {
  address: string,
  defaultGasLimit: number,
  mnemonic: string,
  path: string,
  privateKey: string,
  provider: ProviderType,
  /*
   * @TODO Create Flow transaction types
   */
  sign: (transaction: *) => string,
};

export type ColonyWalletExportType = {
  wallet: {},
  about: {
    name: string,
    version: string,
    environment: string,
  },
  providers: {},
  utils: {},
  debug?: {},
};
