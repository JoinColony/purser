import { detect } from '../../src/helpers';
import { helpers as messages } from '../../src/messages';
import { testGlobal } from '../../../testutils';

describe('Metamask` Wallet Module', () => {
  describe('`detect()` helper method', () => {
    test('Checks if ethereum object is injected', async () => {
      /*
       * No ethereum object
       */
      testGlobal.ethereum = undefined;
      await expect(detect()).rejects.toThrow();
      await expect(detect()).rejects.toThrow(new Error(messages.noExtension));
    });
    test('Checks if extension is unlocked', async () => {
      /*
       * Mock the `isUnlocked()` ethereum method
       */
      const isUnlocked = jest.fn(async () => false);
      testGlobal.ethereum = {
        isUnlocked,
      };
      await expect(detect()).rejects.toThrow();
      await expect(detect()).rejects.toThrow(new Error(messages.isLocked));
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
      testGlobal.ethereum = {
        isUnlocked,
        isEnabled,
      };
      await expect(detect()).rejects.toThrow();
      await expect(detect()).rejects.toThrow(new Error(messages.notEnabled));
    });
    test('Checks if the proxy has the in-page provider set', async () => {
      testGlobal.ethereum = undefined;
      await expect(detect()).rejects.toThrow(new Error(messages.noExtension));
    });
    test('Returns true if the extension is enabled', async () => {
      /*
       * Metamask is unlocked and enabled
       */
      const isUnlocked = jest.fn(async () => true);
      const isEnabled = jest.fn(async () => true);
      testGlobal.ethereum = {
        isUnlocked,
        isEnabled,
      };
      await expect(detect()).resolves.not.toThrow();
      const wasDetected = await detect();
      expect(wasDetected).toBeTruthy();
    });
    test('Returns true if we can get to the address', async () => {
      /*
       * State available, and we have an address
       */
      testGlobal.ethereum = {
        publicConfigStore: {
          _state: { selectedAddress: 'mocked-selected-address' },
        },
      };
      await expect(detect()).resolves.not.toThrow();
      const wasDetected = await detect();
      expect(wasDetected).toBeTruthy();
    });
  });
});
