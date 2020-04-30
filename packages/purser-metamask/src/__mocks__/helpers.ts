import { testGlobal } from '../../../testutils';

export const detect = jest.fn(() => true);

export const methodCaller = jest.fn((callback) => callback());

export const getInpageProvider = jest.fn(() => testGlobal.web3.currentProvider);

export const setStateEventObserver = jest.fn((callback) => {
  /* eslint-disable-next-line no-underscore-dangle */
  testGlobal.web3.currentProvider.publicConfigStore._events.update.push(
    callback,
  );
});
