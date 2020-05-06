import {
  SignMessageData,
  TransactionObjectTypeWithAddresses,
  VerifyMessageData,
  WalletType,
  WalletSubType,
} from './types';

export default interface PurserWallet {
  address: string;
  readonly chainId: number;
  readonly type: WalletType;
  readonly subtype: WalletSubType;
  getPublicKey: () => Promise<string>;
  sign: (txObject: TransactionObjectTypeWithAddresses) => Promise<string>;
  signMessage: (data: SignMessageData) => Promise<string>;
  verifyMessage: (data: VerifyMessageData) => Promise<boolean>;
}
