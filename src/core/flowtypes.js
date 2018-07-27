/* @flow */

import type { ProviderType, AsyncProviderGeneratorType } from '../flowtypes';

export type DerivationPathObjectType = {|
  purpose?: number,
  coinType?: number,
  account?: number,
  change?: number,
  addressIndex?: number,
|};

export type DerivationPathDefaultType = {
  HEADER_KEY: string,
  PURPOSE: number,
  COIN_MAINNET: number,
  COIN_TESTNET: number,
  ACCOUNT: number,
  CHANGE: number,
  INDEX: number,
  DELIMITER: string,
};

export type TransactionObjectType = {
  derivationPath: string,
  chainId?: number,
  gasPrice?: string,
  gasLimit?: string,
  nonce?: number,
  to?: string,
  value?: string,
  inputData?: string | void,
};

export type WalletObjectType = {
  address: string,
  otherAddresses?: Array<string>,
  defaultGasLimit?: number,
  keystore?: Promise<string>,
  mnemonic?: string,
  path?: string,
  +derivationPath?: Promise<string>,
  privateKey?: string,
  +publicKey?: Promise<string>,
  provider?: ProviderType,
  sign?: (...*) => Promise<TransactionObjectType>,
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
  provider?: AsyncProviderGeneratorType,
  entropy?: Uint8Array,
  password?: string,
};

export type MessageObjectType = {
  path?: string,
  message?: string,
  address?: string,
  signature?: string,
};

/*
 * Types used for modules exports
 */
export type LibraryExportType = {
  wallets: Object,
  about: {
    name: string,
    version: string,
    environment: string,
  },
  utils: Object,
  debug?: Object,
};

export type GenericClassArgumentsType = {
  publicKey?: string,
  chainCode?: string,
  rootDerivationPath?: string,
  addressCount?: number,
  provider?: ProviderType | void,
};
