import type { EventEmitter } from 'events';

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

interface EthereumRequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface EthereumNativeToken {
  name: string;
  symbol: string; // 2-6 characters long
  decimals?: number;
}

export interface EthereumChain {
  chainId: number;
  chainName: string;
  nativeCurrency: EthereumNativeToken;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export interface TokenOptions {
  address: string;
  symbol?: string; // 2-6 characters long (possibly, Metamask's docs are vague)
  decimals?: number;
  image?: string;
}

export interface Token {
  type: 'ERC20'; // Metamask only supports this currently
  options: TokenOptions;
}

export interface MetamaskEthereumGlobal {
  isConnected: () => boolean;
  request<R>(args: EthereumRequestArguments): Promise<R>;
  on: (eventName: ObservableEvents, listener: (any) => void) => EventEmitter;

  /*
   * Experimental part of the Provider API
   * https://docs.metamask.io/guide/ethereum-provider.html#experimental-api
   */
  _metamask: {
    isUnlocked: () => Promise<boolean>;
  };
}

export enum EthereumRequestMethods {
  Accounts = 'eth_accounts',
  RequestAccounts = 'eth_requestAccounts',
  WalletPermissions = 'wallet_getPermissions',
  SwitchChain = 'wallet_switchEthereumChain',
  AddNewChain = 'wallet_addEthereumChain',
  AddToken = 'wallet_watchAsset',
}
