import blockies from 'ethereum-blockies';

import software from '../../software';
import * as utils from '../../utils';

jest.mock('ethereum-blockies');
jest.mock('../../utils');

describe('`software` wallet module', () => {
  afterEach(() => {
    blockies.create.mockClear();
  });
  describe('`SoftwareWallet` Blockie', () => {
    test('Add the `blockie` prop to the wallet instance', async () => {
      const testWallet = await software.SoftwareWallet.create({});
      testWallet.address = '0x123';
      const blockieGetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'blockie',
        'get',
      );
      expect(testWallet).toHaveProperty('blockie');
      expect(await testWallet.blockie).toEqual('base64');
      expect(blockieGetterSpy).toHaveBeenCalled();
      expect(blockies.create).toHaveBeenCalled();
      blockieGetterSpy.mockReset();
      blockieGetterSpy.mockRestore();
    });
    test("Can't get the blockie if no address is available", async () => {
      const testWallet = await software.SoftwareWallet.create({});
      const blockieGetterSpy = jest.spyOn(
        software.SoftwareWallet.prototype,
        'blockie',
        'get',
      );
      expect(testWallet).toHaveProperty('blockie');
      expect(await testWallet.blockie).toEqual(undefined);
      expect(blockieGetterSpy).toHaveBeenCalled();
      expect(utils.error).toHaveBeenCalled();
      expect(blockies.create).not.toHaveBeenCalled();
      blockieGetterSpy.mockReset();
      blockieGetterSpy.mockRestore();
    });
  });
});
