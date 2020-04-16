const mockedState = {
  selectedAddress: 'mocked-selected-address',
  networkVersion: 'mocked-selected-chain-id',
};

const mockedEvents = {
  update: [],
};

const inPageProvider = {
  currentProvider: {
    publicConfigStore: {
      _events: mockedEvents,
      _state: mockedState,
    },
  },
};

export const Web3 = jest.fn().mockImplementation(() => inPageProvider);

export default Web3;
