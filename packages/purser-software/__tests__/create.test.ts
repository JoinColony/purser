import { Wallet as EthersWallet } from 'ethers/wallet';
import { mocked } from 'ts-jest/utils';

import { getRandomValues, warning } from '../../purser-core/src/utils';
import { userInputValidator } from '../../purser-core/src/helpers';

import SoftwareWallet from '../src/SoftwareWallet';
import { create } from '../src';

jest.mock('ethers/wallet');
jest.mock('../src/SoftwareWallet');
jest.mock('../../purser-core/src/helpers');
jest.mock('../../purser-core/src/utils');

const MockedSoftwareWallet = mocked(SoftwareWallet);
const MockedEthersWallet = mocked(EthersWallet);
const mockedGetRandomValues = mocked(getRandomValues);
const mockedWarning = mocked(warning);
const mockedUserInputValidator = mocked(userInputValidator);

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
    MockedSoftwareWallet.mockClear();
    MockedEthersWallet.createRandom.mockClear();
    mockedGetRandomValues.mockClear();
    mockedWarning.mockClear();
    mockedUserInputValidator.mockClear();
  });
  describe('`create()` static method', () => {
    test('Create a new wallet with defaults', async () => {
      await create();
      /*
       * Generates entrophy
       */
      expect(getRandomValues).toHaveBeenCalled();
      /*
       * Creates a random Ethers Wallet instance
       */
      expect(EthersWallet.createRandom).toHaveBeenCalled();
      /*
       * Uses that instance to create a new software wallet
       */
      expect(SoftwareWallet).toHaveBeenCalled();
      expect(SoftwareWallet).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey,
        }),
        { chainId: 1 },
      );
    });
    test("Validate the user's input", async () => {
      await create(mockedArgumentsObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArgumentsObject,
      });
    });
    test('Still creates a wallet even with no entropy', async () => {
      await create({ entropy: null });
      /*
       * Doesn't generate randomness since we overwrite it
       */
      expect(getRandomValues).not.toHaveBeenCalled();
      /*
       * But still creates the wallet
       */
      expect(EthersWallet.createRandom).toHaveBeenCalled();
      /*
       * But warns the user that this is not ideal
       */
      expect(warning).toHaveBeenCalled();
    });
    test('Throws if something goes wrong', async () => {
      /*
       * We mock the implementation of `createRandom` to simulate throwing an Error
       */
      MockedEthersWallet.createRandom.mockImplementation(() => {
        throw new Error();
      });
      await expect(create()).rejects.toThrow();
      expect(SoftwareWallet).not.toHaveBeenCalled();
    });
  });
});
