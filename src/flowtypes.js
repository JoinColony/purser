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
  _events?: Object,
  _web3Provider?: Object,
};

export type AsyncProviderType = Promise<ProviderType>;

export type AsyncProviderGeneratorType = (...*) => AsyncProviderType;

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
  /*
   * Used to select the address index from the trezor wallet
   */
  addressCount?: number,
  privateKey?: string,
  mnemonic?: string,
  path?: string,
  keystore?: string,
  provider?: AsyncProviderType,
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
  etherscan: AsyncProviderGeneratorType,
  infura: AsyncProviderGeneratorType,
  metamask: AsyncProviderGeneratorType,
  jsonRpc: AsyncProviderGeneratorType,
  autoselect: AsyncProviderGeneratorType,
};

export type WalletExportType = {
  create: WalletArgumentsType => Promise<WalletObjectType | void>,
  open: WalletArgumentsType => Promise<WalletObjectType | void>,
  SoftwareWallet?: Class<*>,
  TrezorWallet?: Class<*>,
};

export type UtilsExportType = {
  warning: (...*) => void,
  getRandomValues: (...*) => Uint8Array,
  verbose?: () => boolean,
};

export type WalletIndexExportType = {
  software: WalletExportType,
  hardware: Object,
};

export type ProviderArgumentsType = {
  network?: string,
  apiKey?: string,
  url?: string,
};
