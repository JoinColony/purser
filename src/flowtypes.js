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

export type WalletObjectType = {
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
  privateKey?: string,
  mnemonic?: string,
  path?: string,
  keystore?: string,
  provider?: ProviderType,
  entropy?: Uint8Array,
  password?: string,
};

/*
 * Types used for modules exports
 */

export type ColonyWalletExportType = {
  wallets: Object,
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

export type ProvidersExportType = {
  etherscan: ProviderGeneratorType,
  infura: ProviderGeneratorType,
  metamask: ProviderGeneratorType,
  localhost: ProviderGeneratorType,
  autoselect: ProviderGeneratorType,
};

export type SoftwareWalletExportType = {
  create: WalletArgumentsType => Promise<WalletObjectType>,
  open: WalletArgumentsType => Promise<WalletObjectType | void>,
  SoftwareWallet?: Class<*>,
};

export type UtilsExportType = {
  warn: (...*) => void,
  error: (...*) => void,
  getRandomValues: (...*) => Uint8Array,
  verbose?: () => boolean,
};

export type WalletIndexExportType = {
  software: SoftwareWalletExportType,
};

export type MessagesExportType = {
  warnings: Object,
  errors: Object,
};
