import { fromString } from 'bip32-path';

import {
  derivationPathSerializer,
  userInputValidator,
} from '@colony/purser-core/helpers';
import { PATH, CHAIN_IDS } from '@colony/purser-core/defaults';

import * as utils from '@colony/purser-core/utils';

import trezorWallet from '@colony/purser-trezor';
import TrezorWalletClass from '@colony/purser-trezor/class';
import { payloadListener } from '@colony/purser-trezor/helpers';
import { PAYLOAD_XPUB } from '@colony/purser-trezor/payloads';
import { STD_ERRORS } from '@colony/purser-trezor/defaults';

jest.mock('bip32-path');
jest.mock('@colony/purser-trezor/class');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);
jest.mock('@colony/purser-trezor/helpers', () =>
  require('@mocks/purser-trezor/helpers'),
);

describe('Trezor` Hardware Wallet Module', () => {
  afterEach(() => {
    TrezorWalletClass.mockReset();
    TrezorWalletClass.mockRestore();
    utils.warning.mockClear();
    userInputValidator.mockClear();
  });
  describe('`open()` static method with defaults', () => {
    test('Open the wallet with defaults', async () => {
      const { type, requiredFirmware } = PAYLOAD_XPUB;
      await trezorWallet.open();
      expect(TrezorWalletClass).toHaveBeenCalled();
      /*
       * Expect to use the correct coin type
       */
      expect(derivationPathSerializer).toHaveBeenCalled();
      expect(derivationPathSerializer).toHaveBeenCalledWith({
        coinType: PATH.COIN_MAINNET,
        change: PATH.CHANGE,
      });
      /*
       * Expect to convert the derivation path into an path array
       * (This is the format the Trezor service accepts)
       */
      expect(fromString).toHaveBeenCalled();
      /*
       * Expect the payload and firmware to be correct
       */
      expect(payloadListener).toHaveBeenCalled();
      expect(payloadListener).toHaveBeenCalledWith({
        /*
         * We only care about what payload type this method sends
         */
        payload: expect.objectContaining({
          type,
          requiredFirmware,
        }),
      });
    });
    test("Validate the user's input", async () => {
      const mockedArgumentsObject = {
        mockedArgument: 'mocked-argument',
      };
      await trezorWallet.open(mockedArgumentsObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArgumentsObject,
      });
    });
    test('Open the wallet with 20 addresss', async () => {
      const addressesToOpen = 20;
      await trezorWallet.open({ addressCount: addressesToOpen });
      expect(TrezorWalletClass).toHaveBeenCalled();
      expect(TrezorWalletClass).toHaveBeenCalledWith(
        /*
         * We only care about the address count
         */
        expect.objectContaining({
          addressCount: addressesToOpen,
        }),
      );
    });
    test('Sets the derivation path coin to the mainnet type', async () => {
      await trezorWallet.open({ chainId: CHAIN_IDS.HOMESTEAD });
      /*
       * Should set the coin to the mainnet 60 type
       */
      expect(derivationPathSerializer).toHaveBeenCalled();
      expect(derivationPathSerializer).toHaveBeenCalledWith(
        expect.objectContaining({
          coinType: PATH.COIN_MAINNET,
        }),
      );
    });
    test('Sets the derivation path coin to the testnet type', async () => {
      await trezorWallet.open({ chainId: 123123123 });
      /*
       * Should set the coin to the testnet 1 type
       */
      expect(derivationPathSerializer).toHaveBeenCalled();
      expect(derivationPathSerializer).toHaveBeenCalledWith(
        expect.objectContaining({
          coinType: PATH.COIN_TESTNET,
        }),
      );
    });
    test('Log a warning if the user cancels', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a cancel response.
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error(STD_ERRORS.CANCEL_ACC_EXPORT)),
      );
      await trezorWallet.open();
      expect(TrezorWalletClass).not.toHaveBeenCalled();
      /*
       * User cancelled, so we don't throw
       */
      expect(utils.warning).toHaveBeenCalled();
    });
    test('Throw if something else goes wrong', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * a cancel response.
       */
      payloadListener.mockImplementation(() =>
        Promise.reject(new Error('Something went wrong')),
      );
      expect(trezorWallet.open()).rejects.toThrow();
      expect(TrezorWalletClass).not.toHaveBeenCalled();
    });
  });
});
