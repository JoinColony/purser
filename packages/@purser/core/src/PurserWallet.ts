import {
  SignMessageData,
  TransactionObjectTypeWithAddresses,
  VerifyMessageData,
} from './types';

import { WalletType, WalletSubType } from './constants';

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
