import blockies from 'ethereum-blockies';

import wallet from '../../softwareWallet';
import * as utils from '../../utils';

jest.mock('ethereum-blockies');
jest.mock('../../utils');

describe('`software` wallet module', () => {
  afterEach(() => {
    blockies.create.mockClear();
  });
  describe('`SoftwareWallet` Blockie', () => {
    test('Add the `blockie` prop to the wallet instance', () => {
      const testWallet = wallet.SoftwareWallet.create({});
      testWallet.address = '0x123';
      const blockieGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'blockie',
        'get',
      );
      expect(testWallet).toHaveProperty('blockie');
      expect(testWallet.blockie).resolves.toEqual('base64');
      expect(blockieGetterSpy).toHaveBeenCalled();
      expect(blockies.create).toHaveBeenCalled();
      blockieGetterSpy.mockReset();
      blockieGetterSpy.mockRestore();
    });
    test("Can't get the blockie if no address is available", () => {
      const testWallet = wallet.SoftwareWallet.create({});
      const blockieGetterSpy = jest.spyOn(
        wallet.SoftwareWallet.prototype,
        'blockie',
        'get',
      );
      expect(testWallet).toHaveProperty('blockie');
      expect(testWallet.blockie).resolves.toEqual(undefined);
      expect(blockieGetterSpy).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(blockies.create).not.toHaveBeenCalled();
      blockieGetterSpy.mockReset();
      blockieGetterSpy.mockRestore();
    });
  });
});
