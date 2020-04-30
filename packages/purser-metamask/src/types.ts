import BigNumber from 'bn.js';
// We're importing the type here to make eslint happy (just a dev dependency)
import type { TransactionConfig } from 'web3-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Web3CallbackType = (error: Error, result: string) => any;

export interface Web3TransactionType {
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
}

// This is surely not an exhaustive representation of the MM state, but it's close
export interface MetaMaskInpageProvider {
  selectedAddress: string | null;
  networkVersion: string;
  chainId: string;
  // There are surely more events but this is the one we care about
  on(event: 'accountsChanged', listener: (MetaMaskInpageProvider) => void);
  publicConfigStore: {
    _events: {
      update: Array<(state: MetaMaskInpageProvider) => void>;
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
  enable: (force?: boolean) => void;
  autoRefreshOnNetworkChange: boolean;
  _metamask: {
    isEnabled: () => boolean;
    isApproved: () => Promise<boolean>;
    isUnlocked: () => Promise<boolean>;
  };
}

export type MetamaskStateEventsObserverType = (
  state: MetaMaskInpageProvider,
) => void;

export interface MetamaskWalletConstructorArgumentsType {
  address: string;
}

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
  transactionConfig: TransactionConfig,
  callback: Web3CallbackType,
) => void;

export type verifyMessageMethodType = (
  message: string,
  signature: string,
  callback: Web3CallbackType,
) => void;
