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
  _events: Object,
  _web3Provider?: Object,
};

export type ProviderGeneratorType = (...*) => ProviderType;

export type WalletType = {
  address: string,
  defaultGasLimit: number,
  keystore?: Promise<string>,
  mnemonic: string,
  path: string,
  privateKey: string,
  provider: ProviderType,
  /*
   * @TODO Create Flow transaction types
   */
  sign: (transaction: *) => string,
};

export type WalletArgumentsType = {
  privatekey?: string,
  provider?: ProviderType,
  entrophy?: Uint8Array,
  password?: string,
};

/*
 * Types used for modules exports
 */

export type ColonyWalletExportType = {
  wallet: Object,
  about: {
    name: string,
    version: string,
    environment: string,
  },
  providers: Object,
  utils: Object,
  debug?: Object,
};

export type DebugExportType = {
  debug: Object,
};
