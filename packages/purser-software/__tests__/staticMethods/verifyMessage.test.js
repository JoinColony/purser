import { verifyMessage as verifyEthersMessage } from 'ethers/utils';

import { messageVerificationObjectValidator } from '@colony/purser-core/helpers';
import { addressValidator } from '@colony/purser-core/validators';

import { verifyMessage } from '@colony/purser-software/staticMethods';

jest.dontMock('@colony/purser-software/staticMethods');

jest.mock('ethers/utils');
jest.mock('@colony/purser-core/validators');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/normalizers', () =>
  require('@mocks/purser-core/normalizers'),
);

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
    verifyEthersMessage.mockClear();
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
      expect(verifyMessage()).rejects.toThrow();
    });
  });
});
