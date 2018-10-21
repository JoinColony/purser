import { detect } from '@colony/purser-metamask/helpers';

import { helpers as messages } from '@colony/purser-metamask/messages';

jest.dontMock('@colony/purser-metamask/helpers');

describe('Metamask` Wallet Module', () => {
  describe('`detect()` helper method', () => {
    test('Checks if ethereum object is injected', async () => {
      /*
       * No ethereum object
       */
      global.ethereum = undefined;
      global.web3 = undefined;
      expect(detect()).rejects.toThrow();
      expect(detect()).rejects.toThrowError(new Error(messages.noExtension));
    });
    test('Checks if extension is unlocked', async () => {
      /*
       * Mock the `isUnlocked()` ethereum method
       */
      const isUnlocked = jest.fn(async () => false);
      global.ethereum = {
        isUnlocked,
      };
      global.web3 = undefined;
      expect(detect()).rejects.toThrow();
      expect(detect()).rejects.toThrowError(new Error(messages.isLocked));
    });
    test('Checks if extension is enabled', async () => {
      /*
       * To reach this step, the extension already needs to be unlocked
       * (isUnlocked should return true)
       *
       * Mock the `isEnabled()` ethereum method
       */
      const isUnlocked = jest.fn(async () => true);
      const isEnabled = jest.fn(async () => false);
      global.ethereum = {
        isUnlocked,
        isEnabled,
      };
      global.web3 = undefined;
      expect(detect()).rejects.toThrow();
      expect(detect()).rejects.toThrowError(new Error(messages.notEnabled));
    });
    test('Checks if the proxy has the in-page provider set', async () => {
      /*
       * Global proxy, but no provider
       */
      global.ethereum = undefined;
      global.web3 = {};
      expect(detect()).rejects.toThrow();
      /*
       * Provider set, but empty
       */
      global.web3 = { currentProvider: {} };
      expect(detect()).rejects.toThrowError(
        new Error(messages.noInpageProvider),
      );
    });
    test('Checks if the provider has internal state', async () => {
      /*
       * Provider available, but no state
       */
      global.ethereum = undefined;
      global.web3 = { currentProvider: { publicConfigStore: {} } };
      expect(detect()).rejects.toThrow();
      expect(detect()).rejects.toThrowError(
        new Error(messages.noProviderState),
      );
    });
    test('Checks if the provider (legacy) is enabled', async () => {
      /*
       * State available, but no enabled
       */
      global.ethereum = undefined;
      global.web3 = { currentProvider: { publicConfigStore: { _state: {} } } };
      expect(detect()).rejects.toThrow();
      expect(detect()).rejects.toThrowError(new Error(messages.notEnabled));
    });
    test('Returns true if the extension is enabled', async () => {
      /*
       * Metamask is unlocked and enabled
       */
      const isUnlocked = jest.fn(async () => true);
      const isEnabled = jest.fn(async () => true);
      global.ethereum = {
        isUnlocked,
        isEnabled,
      };
      expect(detect()).resolves.not.toThrow();
      const wasDetected = await detect();
      expect(wasDetected).toBeTruthy();
    });
    test('Returns true if we can get to the address', async () => {
      /*
       * State available, and we have an address
       */
      global.ethereum = undefined;
      global.web3 = {
        currentProvider: {
          publicConfigStore: {
            _state: { selectedAddress: 'mocked-selected-address' },
          },
        },
      };
      expect(detect()).resolves.not.toThrow();
      const wasDetected = await detect();
      expect(wasDetected).toBeTruthy();
    });
  });
});
