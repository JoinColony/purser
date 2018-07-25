/* @flow */

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
