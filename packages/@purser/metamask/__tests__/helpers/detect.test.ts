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
    test('Checks if provider is connected to chain', async () => {
      /*
       * Mock the `isUnlocked()` ethereum method
       */
      const isConnected = jest.fn(() => false);
      testGlobal.ethereum = {
        isConnected,
      };
      await expect(detect()).rejects.toThrow();
      await expect(detect()).rejects.toThrow(new Error(messages.noProvider));
    });
    test('Checks if the account is unlocked', async () => {
      /*
       * To reach this step, the extension already needs to be unlocked
       * (isUnlocked should return true)
       *
       * Mock the `isEnabled()` ethereum method
       */
      const isConnected = jest.fn(() => true);
      const isUnlocked = jest.fn(async () => false);
      testGlobal.ethereum = {
        isConnected,
        _metamask: {
          isUnlocked,
        },
      };
      await expect(detect()).rejects.toThrow();
      await expect(detect()).rejects.toThrow(new Error(messages.isLocked));
    });
    test('Checks if we have permission to access the account', async () => {
      /*
       * To reach this step, the extension already needs to be unlocked
       * (isUnlocked should return true)
       *
       * Mock the `isEnabled()` ethereum method
       */
      const request = jest.fn(async () => []);
      const isConnected = jest.fn(() => true);
      const isUnlocked = jest.fn(async () => true);
      testGlobal.ethereum = {
        isConnected,
        request,
        _metamask: {
          isUnlocked,
        },
      };
      await expect(detect()).rejects.toThrow();
      await expect(detect()).rejects.toThrow(new Error(messages.notConnected));
    });
    test('Returns true if the extension is enabled', async () => {
      /*
       * Metamask is unlocked and enabled
       */
      const request = jest.fn(async () => [
        { parentCapability: 'eth_accounts' },
      ]);
      const isConnected = jest.fn(() => true);
      const isUnlocked = jest.fn(async () => true);
      testGlobal.ethereum = {
        isConnected,
        request,
        _metamask: {
          isUnlocked,
        },
      };
      await expect(detect()).resolves.not.toThrow();
      const wasDetected = await detect();
      expect(wasDetected).toBeTruthy();
    });
  });
});
