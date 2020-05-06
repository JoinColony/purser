import { Signer } from 'ethers';
import { BaseProvider } from 'ethers/providers';
import { mocked } from 'ts-jest/utils';

import { userInputValidator } from '../../purser-core/src/helpers';
import { WalletType, WalletSubType } from '../../purser-core/src/constants';

import EthersSigner from '../src/EthersSigner';

jest.mock('../../purser-core/src/helpers');

const mockedUserInputValidator = mocked(userInputValidator);
const { bigNumberify } = jest.requireActual('ethers/utils');

/*
 * Common values
 */
const mockedPurserWalletInstance = {
  address: '0xacab',
  chainId: 1,
  type: WalletType.Software,
  subtype: WalletSubType.Ethers,
  getPublicKey: jest.fn(),
  signMessage: jest.fn(),
  sign: jest.fn(),
  verifyMessage: jest.fn(),
};
const mockedProvider = new BaseProvider(null);
const mockedArguments = {
  purserWallet: mockedPurserWalletInstance,
  provider: mockedProvider,
};

describe('`Core` Module', () => {
  afterEach(() => {
    mockedUserInputValidator.mockClear();
  });
  describe('`EthersSigner` class', () => {
    test('Creates a new signer instance', () => {
      const signer = new EthersSigner(mockedArguments);
      expect(signer).toBeInstanceOf(EthersSigner);
    });
    test('Is an extended instance of Ethers Signer', () => {
      const signer = new EthersSigner(mockedArguments);
      expect(signer).toBeInstanceOf(Signer);
    });
    test('Validates the input before instantiating', () => {
      /* eslint-disable-next-line no-new */
      new EthersSigner(mockedArguments);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArguments,
        requiredAll: ['purserWallet', 'provider'],
      });
    });
    test('The signer instance has the required (correct) props', () => {
      const signer = new EthersSigner(mockedArguments);
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
      const signer = new EthersSigner(mockedArguments);
      expect(signer.provider).toEqual(expect.objectContaining(mockedProvider));
    });
    test('Correctly gets the address', async () => {
      const signer = new EthersSigner(mockedArguments);
      const signerAddress = await signer.getAddress();
      expect(signerAddress).toEqual(mockedPurserWalletInstance.address);
    });
    test('Calls the correct method to sign a message', async () => {
      const signer = new EthersSigner(mockedArguments);
      await signer.signMessage('msg');
      expect(mockedPurserWalletInstance.signMessage).toHaveBeenCalledWith({
        message: 'msg',
      });
    });
    test('Calls the correct provider method to send a tansaction', async () => {
      jest
        .spyOn(mockedProvider, 'sendTransaction')
        .mockImplementationOnce(jest.fn());
      const ethersTxRequest = {
        nonce: bigNumberify(1),
        gasLimit: bigNumberify(2),
        gasPrice: bigNumberify(3),
        data: 'somedata',
        value: bigNumberify(4),
        chainId: 1337,
      };
      const signer = new EthersSigner(mockedArguments);
      await signer.sendTransaction(ethersTxRequest);
      expect(mockedPurserWalletInstance.sign).toHaveBeenCalledWith({
        chainId: 1337,
        gasLimit: '2',
        gasPrice: '3',
        inputData: 'somedata',
        nonce: 1,
        value: '4',
      });
      expect(mockedProvider.sendTransaction).toHaveBeenCalled();
    });
  });
});
