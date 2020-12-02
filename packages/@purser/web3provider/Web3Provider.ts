import {
  PurserWallet,
  SignMessageData,
  TransactionObjectTypeWithAddresses,
  VerifyMessageData,
  WalletType,
  WalletSubType,
} from '@purser/core';

class Web3Provider implements PurserWallet {
  // https://eips.ethereum.org/EIPS/eip-1193#api
  // https://docs.walletconnect.org/quick-start/dapps/web3-provider
  constructor(web3provider: EIP1193Provider, opts) {
    this.address = '0xacab';
    this.type = WalletType.Software;
    // @TODO change the following lines
    this.subtype = WalletSubType.Generic;
    this.chainId = 1337;
  }

  async getPublicKey() {
    throw new Error('getPublicKey not implemented');
  }

  async sign(txObject: TransactionObjectTypeWithAddresses): Promise<string> {
    throw new Error('sign not implemented');
  }

  async signMessage(data: SignMessageData): Promise<string> {
    throw new Error('signMessage not implemented');
  }

  async verifyMessage(data: VerifyMessageData): Promise<boolean> {
    throw new Error('verifyMessage not implemented');
  }
}

export default Web3Provider;
