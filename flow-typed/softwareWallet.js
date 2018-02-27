declare type WalletType = {
  address: string,
  defaultGasLimit: number,
  mnemonic: string,
  path: string,
  privateKey: string,
  provider: ProviderType,
  /*
   * @TODO Create Flow transaction types
   */
  sign: (transaction: *) => string,
};
