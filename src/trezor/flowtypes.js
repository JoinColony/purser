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
  domain?: string,
  version?: number,
  url?: string,
  key?: string,
  keyValue?: any,
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
  r?: string,
  s?: string,
  v?: number,
};
