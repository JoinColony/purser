import { testGlobal } from '../../../testutils';

export const detect = jest.fn(() => true);

export const methodCaller = jest.fn((callback) => callback());

export const setStateEventObserver = jest.fn((callback) => {
  /* eslint-disable-next-line no-underscore-dangle */
  testGlobal.ethereum.publicConfigStore._events.update.push(callback);
});
