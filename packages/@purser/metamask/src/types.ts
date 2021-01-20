export type AccountsChangedCallback = (accounts: string[]) => void;

export interface MetamaskWalletConstructorArgumentsType {
  address: string;
}

export interface SignMessageObject {
  currentAddress: string;
  message: string;
  messageData: string | Uint8Array;
}

export type ObservableEvents =
  | 'accountsChanged'
  | 'chainChanged'
  | 'connect'
  | 'disconnect'
  | 'message';
