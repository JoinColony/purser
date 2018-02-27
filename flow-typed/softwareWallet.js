declare type WalletType = {
  address: string,
  defaultGasLimit: number,
  mnemonic: string,
  path: string,
  privateKey: string,
  provider: *,
  sign: (transaction: *) => string,
  get defaultGasLimit (): number,
  set defaultGasLimit (value: number): number,
  get provider (): *,
  set provider (value: *): *,
};
