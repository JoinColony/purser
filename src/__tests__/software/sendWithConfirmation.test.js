import { Wallet as EthersWallet } from 'ethers/wallet';
import { create } from '../../software';
import * as utils from '../../core/utils';

/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../core/utils', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__remocks__/utils'),
);

const testTransactionData = {
  from: '0x2',
  nonce: 1,
};

describe('`software` wallet module', () => {
  describe('`SoftwareWallet` sendWithConfirmation() Method', () => {
    test('After creation, the wallet has the method', async () => {
      const testWallet = await create();
      expect(testWallet).toHaveProperty('sendWithConfirmation');
    });
    test('After approval, sends the transaction', async () => {
      const testWallet = await create();
      const transactionHash = await testWallet.sendWithConfirmation(
        testTransactionData,
        true,
      );
      expect(transactionHash).toEqual('0x0transactionhash0');
      expect(EthersWallet.prototype.sendTransaction).toHaveBeenCalled();
      expect(EthersWallet.prototype.sendTransaction).toHaveBeenCalledWith(
        testTransactionData,
      );
    });
    test('User denied, reject the promise and log a warning', async () => {
      const testWallet = await create();
      const rejectedTransactionHash = testWallet.sendWithConfirmation(
        testTransactionData,
        false,
      );
      expect(utils.warning).toHaveBeenCalled();
      expect(rejectedTransactionHash).rejects.toEqual();
    });
    test('If confirmation is ommited, reject by default', async () => {
      const testWallet = await create();
      const rejectedTransactionHash = testWallet.sendWithConfirmation(
        testTransactionData,
      );
      expect(utils.warning).toHaveBeenCalled();
      expect(rejectedTransactionHash).rejects.toEqual();
    });
    test('Confirmation should work as a plain boolean', async () => {
      const testWallet = await create();
      const approvedTransactionHash = testWallet.sendWithConfirmation(
        testTransactionData,
        true,
      );
      const rejectedTransactionHash = testWallet.sendWithConfirmation(
        testTransactionData,
        false,
      );
      expect(approvedTransactionHash).resolves.toEqual('0x0transactionhash0');
      expect(rejectedTransactionHash).rejects.toEqual();
    });
    test('Confirmation should also work as an async function', async () => {
      const testWallet = await create();
      const approvedTransactionHash = testWallet.sendWithConfirmation(
        testTransactionData,
        Promise.resolve(true),
      );
      const rejectedTransactionHash = testWallet.sendWithConfirmation(
        testTransactionData,
        Promise.resolve(false),
      );
      expect(approvedTransactionHash).resolves.toEqual('0x0transactionhash0');
      expect(rejectedTransactionHash).rejects.toEqual();
    });
  });
});
