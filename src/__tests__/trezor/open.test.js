import { fromString } from 'bip32-path';

import { derivationPathSerializer } from '../../core/helpers';
import { PATH, NETWORK_IDS } from '../../core/defaults';

import * as utils from '../../core/utils';

import trezorWallet from '../../trezor';
import TrezorWalletClass from '../../trezor/class';
import { payloadListener } from '../../trezor/helpers';
import { PAYLOAD_XPUB } from '../../trezor/payloads';
import { STD_ERRORS } from '../../trezor/defaults';

jest.mock('bip32-path');
jest.mock('../../trezor/class');
jest.mock('../../core/helpers');
jest.mock('../../core/utils');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../trezor/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../trezor/__remocks__/helpers'),
);

describe('Trezor` Hardware Wallet Module', () => {
  afterEach(() => {
    TrezorWalletClass.mockReset();
    TrezorWalletClass.mockRestore();
    utils.warning.mockReset();
    utils.warning.mockRestore();
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
      await trezorWallet.open({ chainId: NETWORK_IDS.HOMESTEAD });
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
