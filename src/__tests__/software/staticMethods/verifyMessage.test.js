import { Wallet as EthersWallet } from 'ethers/wallet';

import { messageVerificationObjectValidator } from '../../../core/helpers';
import { addressValidator } from '../../../core/validators';

import { verifyMessage } from '../../../software/staticMethods';

jest.dontMock('../../../software/staticMethods');

jest.mock('ethers/wallet');
jest.mock('../../../core/helpers');
jest.mock('../../../core/normalizers');
jest.mock('../../../core/validators');

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const message = 'mocked-message';
const signature = 'mocked-signature';
const mockedAddress = 'mocked-address';
const mockedRecoveredAddress = 'mocked-recovered-address';
const mockedArgumentsObject = {
  message,
  signature,
};
describe('`Software` Wallet Module', () => {
  afterEach(() => {
    messageVerificationObjectValidator.mockClear();
    addressValidator.mockClear();
    EthersWallet.verifyMessage.mockClear();
  });
  describe('`verifyMessage()` static method', () => {
    test('Calls the correct EthersWallet static method', async () => {
      await verifyMessage(mockedArgumentsObject);
      expect(EthersWallet.verifyMessage).toHaveBeenCalled();
      expect(EthersWallet.verifyMessage).toHaveBeenCalledWith(
        message,
        signature,
      );
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
      expect(verifyMessage()).rejects.toThrow();
    });
  });
});
