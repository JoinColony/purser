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
