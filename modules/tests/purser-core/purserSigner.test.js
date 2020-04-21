import { Signer } from 'ethers';

import PurserSigner from '@colony/purser-core/purserSigner';
import { userInputValidator } from '@colony/purser-core/helpers';

import { REQUIRED_PROPS } from '@colony/purser-core/defaults';

jest.dontMock('@colony/purser-core/purserSigner');

jest.mock('ethers');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);

/*
 * Common values
 */
const mockedPurserWalletInstance = {
  address: '0x0',
  signMessage: jest.fn(),
};
const mockedProvider = {
  sendTransaction: jest.fn(),
};
const mockedArguments = {
  purserWalletInstance: mockedPurserWalletInstance,
  provider: mockedProvider,
};

describe('`Core` Module', () => {
  afterEach(() => {
    userInputValidator.mockClear();
  });
  describe('`PurserSigner` class', () => {
    test('Creates a new signer instance', () => {
      const signer = new PurserSigner(mockedArguments);
      expect(signer).toBeInstanceOf(PurserSigner);
    });
    test('Is an extended instance of Ethers Signer', () => {
      const signer = new PurserSigner(mockedArguments);
      expect(signer).toBeInstanceOf(Signer);
    });
    test('Validates the input before instantiating', () => {
      /* eslint-disable-next-line no-new */
      new PurserSigner(mockedArguments);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArguments,
        requiredAll: REQUIRED_PROPS.SIGNER_CONSTRUCTOR,
      });
    });
    test('The signer instance has the required (correct) props', () => {
      const signer = new PurserSigner(mockedArguments);
      /*
       * Provider Object
       */
      expect(signer).toHaveProperty('provider', mockedProvider);
      /*
       * `getAddress()` method
       */
      expect(signer).toHaveProperty('getAddress');
      /*
       * `signMessage()` method
       */
      expect(signer).toHaveProperty('signMessage');
      /*
       * `sendTransaction()` method
       */
      expect(signer).toHaveProperty('sendTransaction');
    });
    test('Correctly sets the provider', () => {
      const signer = new PurserSigner(mockedArguments);
      expect(signer.provider).toEqual(expect.objectContaining(mockedProvider));
    });
    test('Correctly gets the address', async () => {
      const signer = new PurserSigner(mockedArguments);
      const signerAddress = await signer.getAddress();
      expect(signerAddress).toEqual(mockedPurserWalletInstance.address);
    });
    test('Calls the correct method to sign a message', async () => {
      const signer = new PurserSigner(mockedArguments);
      await signer.signMessage();
      expect(mockedPurserWalletInstance.signMessage).toHaveBeenCalled();
    });
    test('Calls the correct provider method to send a tansaction', async () => {
      const signer = new PurserSigner(mockedArguments);
      await signer.sendTransaction();
      expect(mockedProvider.sendTransaction).toHaveBeenCalled();
    });
  });
});
