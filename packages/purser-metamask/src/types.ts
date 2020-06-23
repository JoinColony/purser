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

export interface SignMessageObject {
  currentAddress: string;
  message: string;
  messageData: string | Uint8Array;
}
