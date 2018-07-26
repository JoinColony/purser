import { fromString } from 'bip32-path';

import { derivationPathSerializer } from '../../core/helpers';
import { PATH } from '../../core/defaults';

import { jsonRpc } from '../../providers';
import * as utils from '../../core/utils';

import trezorWallet from '../../trezor';
import TrezorWalletClass from '../../trezor/class';
import { payloadListener } from '../../trezor/helpers';
import { PAYLOAD_XPUB } from '../../trezor/payloads';
import { STD_ERRORS } from '../../trezor/defaults';

jest.mock('bip32-path');
jest.mock('../../trezor/class');
jest.mock('../../trezor/helpers');

/*
 * Manual mocking a manual mock. Yay for Jest being build by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../core/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__mocks-required__/helpers'),
);
jest.mock('../../core/utils', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__mocks-required__/utils'),
);

describe('Trezor` Hardware Wallet Module', () => {
  afterEach(() => {
    TrezorWalletClass.mockReset();
    TrezorWalletClass.mockRestore();
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
    test('Open the wallet and set a provider', async () => {
      await trezorWallet.open({ provider: jsonRpc });
      expect(TrezorWalletClass).toHaveBeenCalled();
      expect(TrezorWalletClass).toHaveBeenCalledWith(
        /*
        * We only care that the provider generator method gets instantiated
        */
        expect.objectContaining({
          providerMode: await jsonRpc(),
        }),
      );
      /*
       * We have a deprecation warning
       */
      expect(utils.warning).toHaveBeenCalled();
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
