import BigNumber from 'bn.js';
import { IpcProvider } from 'web3-core';

export interface MetamaskInpageProvider extends IpcProvider {
  enable: () => Promise<Array<string>>;
  mux: Record<string, any>;
  // There are surely more events but this is the one we care about
  on(event: 'accountsChanged', listener: (accounts: string[]) => void);
  publicConfigStore: {
    _events: any;
    _state: any;
  };
  rpcEngine: Record<string, any>;
}

export type Web3CallbackType = (error: Error, result: string) => any;

export type Web3TransactionType = {
  blockHash: string;
  blockNumber: number;
  from: string;
  gas: number;
  gasPrice: BigNumber;
  hash: string;
  input: string;
  nonce: number;
  r: string;
  s: string;
  to: string;
  transactionIndex: number;
  v: string;
  value: string;
};

// This is surely not an exhaustive representation of the MM state, but it's close
export interface MetaMaskState {
  selectedAddress: string | null;
  networkVersion: string;
  chainId: string;
  publicConfigStore: {
    _events: {
      update: Array<(state: MetaMaskState) => void>;
    };
    _eventsCount: number;
    _maxListeners: number | undefined;
    _state: {
      isUnlocked: boolean;
      isEnabled: boolean;
      selectedAddress: string | null;
      networkVersion: string;
      onboardingcomplete: boolean;
      chainId: string;
    };
  };
  enable: (force: boolean) => void;
  autoRefreshOnNetworkChange: boolean;
  _metamask: {
    isEnabled: () => boolean;
    isApproved: () => Promise<boolean>;
    isUnlocked: () => Promise<boolean>;
  };
}

export type MetamaskStateEventsObserverType = (state: MetaMaskState) => void;

export type MetamaskWalletConstructorArgumentsType = {
  address: string;
};

export type getTransactionMethodType = (
  transactionHash: string,
) => Promise<Web3TransactionType>;

export type signMessageMethodType = (
  signature: string,
  currentAddress: string,
  callback: Web3CallbackType,
) => void;

export interface SignMessageObject {
  currentAddress: string;
  message: string;
  messageData: string | Uint8Array;
}

export type signTrasactionMethodType = (
  transactionObject: Record<string, any>,
  callback: Web3CallbackType,
) => void;

export type verifyMessageMethodType = (
  message: string,
  signature: string,
  callback: Web3CallbackType,
) => void;
