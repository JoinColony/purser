export const detect = jest.fn(() => true);

export const methodCaller = jest.fn(callback => callback());

const mockedState = {
  selectedAddress: 'mocked-selected-address',
  networkVersion: 'mocked-selected-chain-id',
};

export const getInpageProvider = jest.fn(() => ({
  publicConfigStore: {
    _state: mockedState,
  },
}));

export const setStateEventObserver = jest.fn();
