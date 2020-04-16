const anyGlobal: any = global;

export const detect = jest.fn(() => true);

export const methodCaller = jest.fn(callback => callback());

export const getInpageProvider = jest.fn(() => anyGlobal.web3.currentProvider);

export const setStateEventObserver = jest.fn(callback => {
  /* eslint-disable-next-line no-underscore-dangle */
  anyGlobal.web3.currentProvider.publicConfigStore._events.update.push(
    callback,
  );
});

/*
 * This does not exist in the main library.
 * It's only here to help us trigger a state update
 */
export const triggerUpdateStateEvents = newState =>
  /* eslint-disable-next-line no-underscore-dangle */
  anyGlobal.web3.currentProvider.publicConfigStore._events.update.map(
    callback => callback(newState),
  );
