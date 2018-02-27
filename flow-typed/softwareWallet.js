declare type WalletType = {
  address: string,
  defaultGasLimit: number,
  mnemonic: string,
  path: string,
  privateKey: string,
  provider: ProviderType,
  /*
   * @TODO
   * Create transaction types
   */
  sign: (transaction: *) => string,
};
