/* @flow */

export type PayloadType = {
  type: string,
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
  origin: string,
};

export type PayloadResponseType = {
  success: boolean,
};

export type DerivationPathObjectType = {|
  purpose: number,
  coinType: number,
  account: number,
  change: number,
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