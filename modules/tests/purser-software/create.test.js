import { Wallet as EthersWalletClass } from 'ethers/wallet';

import { getRandomValues, warning } from '@colony/purser-core/utils';
import { userInputValidator } from '@colony/purser-core/helpers';

import SoftwareWalletClass from '@colony/purser-software/class';
import softwareWallet from '@colony/purser-software';

jest.dontMock('@colony/purser-software/index');

jest.mock('ethers/wallet');
jest.mock('@colony/purser-software/class');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const password = 'mocked-password';
const privateKey = 'mocked-private-key';
const mockedArgumentsObject = {
  password,
};

describe('`Software` Wallet Module', () => {
  afterEach(() => {
    SoftwareWalletClass.mockClear();
    EthersWalletClass.createRandom.mockClear();
    getRandomValues.mockClear();
    warning.mockClear();
    userInputValidator.mockClear();
  });
  describe('`create()` static method', () => {
    test('Create a new wallet with defaults', async () => {
      await softwareWallet.create();
      /*
       * Generates entrophy
       */
      expect(getRandomValues).toHaveBeenCalled();
      /*
       * Creates a random Ethers Wallet instance
       */
      expect(EthersWalletClass.createRandom).toHaveBeenCalled();
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWalletClass).toHaveBeenCalled();
      expect(SoftwareWalletClass).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
        }),
      );
    });
    test("Validate the user's input", async () => {
      await softwareWallet.create(mockedArgumentsObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArgumentsObject,
      });
    });
    test('Still creates a wallet even with no entrophy', async () => {
      await softwareWallet.create({ entropy: false });
      /*
       * Doesn't generate randomness since we overwrite it
       */
      expect(getRandomValues).not.toHaveBeenCalled();
      /*
       * But still creates the wallet
       */
      expect(EthersWalletClass.createRandom).toHaveBeenCalled();
      /*
       * But warns the user that this is not ideal
       */
      expect(warning).toHaveBeenCalled();
    });
    test('Sets the encryption password if provided', async () => {
      await softwareWallet.create({ password });
      expect(SoftwareWalletClass).toHaveBeenCalled();
      expect(SoftwareWalletClass).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
          password,
        }),
      );
    });
    test('Throws if something goes wrong', async () => {
      /*
       * We mock the implementation of `createRandom` to simulate throwing an Error
       */
      EthersWalletClass.createRandom.mockImplementation(() => {
        throw new Error();
      });
      expect(softwareWallet.create()).rejects.toThrow();
      expect(SoftwareWalletClass).not.toHaveBeenCalled();
    });
  });
});
