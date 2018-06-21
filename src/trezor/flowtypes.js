/* @flow */

export type PayloadType = {
  type: string,
  path?: number[],
};

export type PromptOptionsType = {
  width: number,
  height: number,
  left: number,
  top: number,
  menubar?: boolean,
  toolbar?: boolean,
  location?: boolean,
  personalbar?: boolean,
  status?: boolean,
};

export type ServiceUrlType = {
  domain: string,
  version: number,
  url: string,
  key: string,
};
