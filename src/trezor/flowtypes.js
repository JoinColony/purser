/* @flow */

export type PayloadType = {
  type: string,
  requiredFirmware: string,
  path?: number[],
};

export type WindowFeaturesType = {
  width: number,
  height: number,
  left: number,
  top: number,
};

export type ServiceUrlType = {
  domain: string,
  version: number,
  url: string,
  key: string,
};

export type PayloadListenerType = {
  payload: PayloadType,
  origin?: string,
};

export type PayloadResponseType = {
  success: boolean,
  publicKey: string,
  chainCode: string,
  signature?: string,
};

export type DerivationPathObjectType = {|
  purpose?: number,
  coinType?: number,
  account?: number,
  change?: number,
  addressIndex?: number,
|};

export type DerivationPathDefaultType = {
  PURPOSE: number,
  COIN_MAINNET: number,
  COIN_TESTNET: number,
  ACCOUNT: number,
  CHANGE: number,
  INDEX: number,
};
