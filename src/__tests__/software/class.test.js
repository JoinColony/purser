import { Wallet as EthersWallet, HDNode } from 'ethers/wallet';

import { derivationPathSerializer } from '../../core/helpers';
import { PATH } from '../../core/defaults';
import software from '../../software';
import { jsonRpc } from '../../providers';
import * as utils from '../../core/utils';
import { PROVIDER_PROTO } from '../../defaults';

jest.mock('ethers/wallet');
jest.dontMock('../../software');
jest.dontMock('../../core/helpers');
/*
 * Manual mocking a manual mock. Yay for Jest being build by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../core/utils', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__mocks-required__/utils'),
);

describe('`software` wallet module', () => {
  afterEach(() => {
    EthersWallet.mockClear();
    HDNode.fromMnemonic.mockClear();
    software.SoftwareWallet.mockClear();
  });
  describe('`SoftwareWallet` Class', () => {
    /*
     * Create
     */
    test('Creates a new wallet', async () => {
      const testWallet = await software.SoftwareWallet.create({});
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(testWallet).toBeInstanceOf(software.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(EthersWallet);
    });
    test('Creates a new wallet with a manual provider', async () => {
      const provider = await jsonRpc();
      await software.SoftwareWallet.create({ provider });
      expect(software.SoftwareWallet).toHaveBeenCalled();
      /*
       * `0x1` is the value the `createRandom()` mock returns
       */
      expect(software.SoftwareWallet).toHaveBeenCalledWith('0x1', provider);
    });
    test('Creates a new wallet with a provider generator method', async () => {
      const providerMock = jest.fn(() => () => ({ mocked: true }));
      await software.SoftwareWallet.create({ provider: providerMock });
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(providerMock).toHaveBeenCalled();
    });
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      'Creates a new wallet when provider is set to a falsy value',
      async () => {
        await software.SoftwareWallet.create({ provider: false });
        expect(utils.warning).toHaveBeenCalled();
        expect(software.SoftwareWallet).toHaveBeenCalled();
        /*
         * `0x1` is the value the `createRandom()` mock returns
         */
        expect(software.SoftwareWallet).toHaveBeenCalledWith('0x1', undefined);
      },
    );
    /* eslint-enable prettier/prettier */
    test('Creates a new wallet with manual entropy', async () => {
      const entropy = new Uint8Array(100);
      await software.SoftwareWallet.create({ entropy });
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalledWith({
        extraEntropy: entropy,
      });
    });
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      'Creates a new wallet when entropy is set to a falsy value',
      async () => {
        await software.SoftwareWallet.create({ entropy: false });
        expect(utils.warning).toHaveBeenCalled();
        expect(software.SoftwareWallet.createRandom).toHaveBeenCalled();
        expect(software.SoftwareWallet.createRandom).toHaveBeenCalledWith();
      },
    );
    /* eslint-enable prettier/prettier */
    test("Returns new wallet even when there's and error", async () => {
      await software.SoftwareWallet.create({ provider: { error: true } });
      expect(utils.warning).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalled();
      expect(software.SoftwareWallet.createRandom).toHaveBeenCalledWith();
    });
    /*
     * Open
     */
    test('Opens wallet using a private key', async () => {
      const privateKey = '0x1';
      const testWallet = await software.SoftwareWallet.open({ privateKey });
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalledWith(
        privateKey,
        PROVIDER_PROTO,
      );
      expect(testWallet).toBeInstanceOf(software.SoftwareWallet);
      expect(testWallet).toBeInstanceOf(EthersWallet);
    });
    test('Opens wallet using a mnemonic', async () => {
      const mnemonic = 'romeo delta india golf';
      const privateKey = '0x1';
      await software.SoftwareWallet.open({ mnemonic });
      expect(HDNode.fromMnemonic).toHaveBeenCalled();
      expect(HDNode.fromMnemonic).toHaveBeenCalledWith(mnemonic);
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalledWith(
        privateKey,
        PROVIDER_PROTO,
      );
    });
    test('Opens wallet using a keystore', async () => {
      const keystore = '{"address":"123456"}';
      const password = 'passsword';
      await software.SoftwareWallet.open({ keystore, password });
      expect(software.SoftwareWallet.isEncryptedWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet.fromEncryptedWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet.fromEncryptedWallet).toHaveBeenCalledWith(
        keystore,
        password,
      );
      expect(EthersWallet).toHaveBeenCalled();
      expect(software.SoftwareWallet).toHaveBeenCalled();
    });
    test('Return undefined when no suitable open method provided', async () => {
      /*
       * Jest seems to not play well with unsing `await` when rejecting a promise
       * To be visisted at a later time.
       */
      await software.SoftwareWallet.open({}).catch(wallet => {
        expect(HDNode.fromMnemonic).not.toHaveBeenCalled();
        expect(EthersWallet).toHaveBeenCalled();
        expect(software.SoftwareWallet).toHaveBeenCalled();
        expect(software.SoftwareWallet).toHaveBeenCalledWith(
          undefined,
          PROVIDER_PROTO,
        );
        expect(utils.warning).toHaveBeenCalled();
        expect(wallet).toEqual(new Error());
      });
    });
    test('After open, the wallet should have the `mnemonic` prop', async () => {
      const mnemonic = 'romeo delta india golf';
      const derivationPath = derivationPathSerializer({
        change: PATH.CHANGE,
        addressIndex: PATH.INDEX,
      });
      const testWalletKey = await software.SoftwareWallet.open({
        privateKey: '0x1',
      });
      const testWalletMnemonic = await software.SoftwareWallet.open({
        mnemonic,
      });
      expect(testWalletKey).toBeInstanceOf(software.SoftwareWallet);
      expect(testWalletMnemonic).toBeInstanceOf(software.SoftwareWallet);
      expect(testWalletKey).toHaveProperty('mnemonic', undefined);
      expect(testWalletKey).toHaveProperty('path', derivationPath);
      expect(testWalletMnemonic).toHaveProperty('mnemonic', mnemonic);
      expect(testWalletMnemonic).toHaveProperty('path', derivationPath);
    });
  });
});
