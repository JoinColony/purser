import { fromString } from 'bip32-path';
import TrezorWalletClass from '../../trezor/class';
import trezorWallet from '../../trezor';
import { jsonRpc } from '../../providers';
import * as utils from '../../utils';
import {
  payloadListener,
  derivationPathSerializer,
} from '../../trezor/helpers';
import { PAYLOAD_XPUB } from '../../trezor/payloads';
import { PATH, STD_ERRORS } from '../../trezor/defaults';

jest.mock('bip32-path');
jest.mock('../../trezor/class');
jest.mock('../../trezor/helpers');
jest.mock('../../utils');

describe('`Trezor` wallet module', () => {
  afterEach(() => {
    TrezorWalletClass.mockReset();
    TrezorWalletClass.mockRestore();
  });
  describe('`Trezor` hardware wallet `open()` method', () => {
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
        payload: {
          path: expect.anything() /* Don't care about the derivation path */,
          type,
          requiredFirmware,
        },
      });
    });
    test('Open the wallet with 20 addresss', async () => {
      const addressesToOpen = 20;
      await trezorWallet.open({ addressCount: addressesToOpen });
      expect(TrezorWalletClass).toHaveBeenCalled();
      expect(TrezorWalletClass).toHaveBeenCalledWith(
        expect.anything() /* Don't care about the public key */,
        expect.anything() /* Don't care about the chain code */,
        expect.anything() /* Don't care about the derivation path */,
        addressesToOpen,
        expect.anything() /* Don't care about the provider */,
      );
    });
    test('Open the wallet and set a provider', async () => {
      await trezorWallet.open({ provider: jsonRpc });
      expect(TrezorWalletClass).toHaveBeenCalled();
      expect(TrezorWalletClass).toHaveBeenCalledWith(
        expect.anything() /* Don't care about the public key */,
        expect.anything() /* Don't care about the chain code */,
        expect.anything() /* Don't care about the derivation path */,
        undefined /* Don't care about the address count */,
        await jsonRpc(),
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
