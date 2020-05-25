import ExtendedBN from './ExtendedBigNumber';

export interface DerivationPathDefaultType {
  HEADER_KEY: string;
  PURPOSE: number;
  COIN_MAINNET: number;
  COIN_TESTNET: number;
  ACCOUNT: number;
  CHANGE: number;
  INDEX: number;
  DELIMITER: string;
}

export interface DerivationPathObjectType {
  purpose?: number;
  coinType?: number;
  account?: number;
  change?: number;
  addressIndex?: number;
}

export interface GenericClassArgumentsType {
  publicKey: string;
  chainCode?: string;
  rootDerivationPath: string;
  addressCount?: number;
  chainId?: number;
}

export interface TransactionObjectType {
  chainId: number;
  gasPrice: ExtendedBN;
  gasLimit: ExtendedBN;
  nonce: number;
  value: ExtendedBN;
  inputData: string;
}

export interface TransactionObjectTypeWithCallback
  extends TransactionObjectTypeWithTo {
  callback: (object) => string;
}

export interface TransactionObjectTypeWithTo extends TransactionObjectType {
  to?: string;
}

export interface TransactionObjectTypeWithAddresses
  extends TransactionObjectTypeWithTo {
  from?: string;
}

export interface SignMessageData {
  message?: string;
  messageData?: string | Uint8Array;
}

export interface VerifyMessageData {
  message: string;
  signature: string;
}

export interface WalletObjectType {
  address: string;
  otherAddresses?: Array<string>;
  defaultGasLimit?: number;
  keystore?: Promise<string>;
  mnemonic?: string;
  path?: string;
  readonly derivationPath?: Promise<string>;
  privateKey?: string;
  readonly publicKey?: Promise<string>;
  sign: (...any) => Promise<TransactionObjectType>;
}

export interface MessageObjectType {
  message: string;
}

export interface WalletArgumentsType {
  address?: string;
  /*
   * Used to select the address index from the hardware wallet
   */
  addressCount?: number;
  privateKey?: string;
  mnemonic?: string;
  path?: string;
  keystore?: string;
  entropy?: Uint8Array;
  password?: string;
  chainId?: number;
}

export interface AddressObject {
  publicKey: string;
  derivationPath: string;
  address: string;
}
