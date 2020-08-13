import { verifyMessage as verifyEthersMessage } from 'ethers/utils';
import { mocked } from 'ts-jest/utils';

import { messageVerificationObjectValidator } from '../../../core/src/helpers';
import { addressValidator } from '../../../core/src/validators';

import { verifyMessage } from '../../src/staticMethods';

jest.mock('ethers/utils');
jest.mock('../../../core/src/helpers');
jest.mock('../../../core/src/validators');
jest.mock('../../../core/src/normalizers');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const address = '0xacab';
const message = 'mocked-message';
const signature = 'mocked-signature';
const mockedAddress = 'mocked-address';
const mockedRecoveredAddress = 'mocked-recovered-address';
const mockedArgumentsObject = {
  address,
  message,
  signature,
};
describe('`Software` Wallet Module', () => {
  afterEach(() => {
    mocked(messageVerificationObjectValidator).mockClear();
    mocked(addressValidator).mockClear();
    mocked(verifyEthersMessage).mockClear();
  });
  describe('`verifyMessage()` static method', () => {
    test('Calls the correct EthersWallet static method', async () => {
      await verifyMessage(mockedArgumentsObject);
      expect(verifyEthersMessage).toHaveBeenCalled();
      expect(verifyEthersMessage).toHaveBeenCalledWith(message, signature);
    });
    test("Validates the signature object's values", async () => {
      await verifyMessage(mockedArgumentsObject);
      expect(messageVerificationObjectValidator).toHaveBeenCalled();
      expect(messageVerificationObjectValidator).toHaveBeenCalledWith(
        mockedArgumentsObject,
      );
    });
    test('Validates the current address indidually', async () => {
      await verifyMessage({
        ...mockedArgumentsObject,
        address: mockedAddress,
      });
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedAddress);
    });
    test('Validates the recovered address', async () => {
      await verifyMessage(mockedArgumentsObject);
      expect(addressValidator).toHaveBeenCalled();
      expect(addressValidator).toHaveBeenCalledWith(mockedRecoveredAddress);
    });
    test('Compares the addresses and then returns', async () => {
      const validMessage = await verifyMessage({
        ...mockedArgumentsObject,
        address: mockedRecoveredAddress,
      });
      expect(validMessage).toBeTruthy();
    });
    test('Throws if something goes wrong', async () => {
      // @ts-ignore
      await expect(verifyMessage()).rejects.toThrow();
    });
  });
});
