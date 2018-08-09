const mockedState = {
  selectedAddress: 'mocked-selected-address',
  networkVersion: 'mocked-selected-chain-id',
};

const mockedEvents = {
  update: [],
};

global.web3 = {
  currentProvider: {
    publicConfigStore: {
      _events: mockedEvents,
      _state: mockedState,
    },
  },
};

export const detect = jest.fn(() => true);

export const methodCaller = jest.fn(callback => callback());

export const getInpageProvider = jest.fn(() => global.web3.currentProvider);

export const setStateEventObserver = jest.fn(callback => {
  /* eslint-disable-next-line no-underscore-dangle */
  global.web3.currentProvider.publicConfigStore._events.update.push(callback);
});

/*
 * This does not exist in the main library.
 * It's only here to help us trigger a state update
 */
export const triggerUpdateStateEvents = newState =>
  /* eslint-disable-next-line no-underscore-dangle */
  global.web3.currentProvider.publicConfigStore._events.update.map(callback =>
    callback(newState),
  );
