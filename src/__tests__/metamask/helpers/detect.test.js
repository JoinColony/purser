import { detect } from '../../../metamask/helpers';

import { helpers as messages } from '../../../metamask/messages';

jest.dontMock('../../../metamask/helpers');

describe('Metamask` Wallet Module', () => {
  describe('`detect()` helper method', () => {
    test('Checks if the global proxy is set', async () => {
      /*
       * No global web3 proxy
       */
      global.web3 = undefined;
      expect(() => detect()).toThrow();
      expect(() => detect()).toThrowError(new Error(messages.notInjected));
    });
    test('Checks if the proxy has the in-page provider set', async () => {
      /*
       * Global proxy, but no provider
       */
      global.web3 = {};
      expect(() => detect()).toThrow();
      /*
       * Provider set, but empty
       */
      global.web3 = { currentProvider: {} };
      expect(() => detect()).toThrowError(new Error(messages.noInpageProvider));
    });
    test('Checks if the provider has internal state', async () => {
      /*
       * Provider available, but no state
       */
      global.web3 = { currentProvider: { publicConfigStore: {} } };
      expect(() => detect()).toThrow();
      expect(() => detect()).toThrowError(new Error(messages.noProviderState));
    });
    test('Checks if Metamask is locked (state has address)', async () => {
      /*
       * State available, but no address
       */
      global.web3 = { currentProvider: { publicConfigStore: { _state: {} } } };
      expect(() => detect()).toThrow();
      expect(() => detect()).toThrowError(new Error(messages.isLocked));
    });
    test('Returns true if we can get to the address', async () => {
      /*
       * State available, and we have an address
       */
      global.web3 = {
        currentProvider: {
          publicConfigStore: {
            _state: { selectedAddress: 'mocked-selected-address' },
          },
        },
      };
      expect(() => detect()).not.toThrow();
      const wasDetected = detect();
      expect(wasDetected).toBeTruthy();
    });
  });
});
