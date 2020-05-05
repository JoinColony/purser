import { mocked } from 'ts-jest/utils';
import isEqual from 'lodash.isequal';

import { testGlobal } from '../../testutils';

import { warning } from '../../purser-core/src/utils';
import { hexSequenceNormalizer } from '../../purser-core/src/normalizers';
import { hexSequenceValidator } from '../../purser-core/src/validators';
import {
  recoverPublicKey as recoverPublicKeyHelper,
  userInputValidator,
} from '../../purser-core/src/helpers';
import { WalletType, WalletSubType } from '../../purser-core/src/types';
import { HEX_HASH_TYPE, REQUIRED_PROPS } from '../../purser-core/src/constants';

import MetaMaskWallet from '../src/MetaMaskWallet';
import {
  methodCaller,
  getInpageProvider,
  setStateEventObserver,
} from '../src/helpers';
import { validateMetaMaskState } from '../src/validators';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../src/staticMethods';
import { PUBLICKEY_RECOVERY_MESSAGE, STD_ERRORS } from '../src/constants';
import { MetaMaskInpageProvider } from '../src/types';

jest.mock('lodash.isequal');
jest.mock('../../purser-core/src/validators');
jest.mock('../../purser-core/src/helpers');
jest.mock('../../purser-core/src/normalizers');
jest.mock('../../purser-core/src/utils');
jest.mock('../src/staticMethods');
jest.mock('../src/helpers');
jest.mock('../src/validators');

const mockedIsEqual = mocked(isEqual);
const mockedValidateMetaMaskState = mocked(validateMetaMaskState);
const mockedHexSequenceNormalizer = mocked(hexSequenceNormalizer);
const mockedHexSequenceValidator = mocked(hexSequenceValidator);
const mockedRecoverPublicKeyHelper = mocked(recoverPublicKeyHelper);
const mockedWarning = mocked(warning);
const mockedBufferFrom = jest.spyOn(Buffer, 'from');
const mockedBufferToString = jest.spyOn(Buffer.prototype, 'toString');

const mockedMessageSignature = 'mocked-message-signature';

const triggerUpdateStateEvents = (newState: MetaMaskInpageProvider): void =>
  /* eslint-disable-next-line no-underscore-dangle */
  testGlobal.web3.currentProvider.publicConfigStore._events.update.map(
    (callback) => callback(newState),
  );

/*
 * Mock the injected web3 proxy object
 */
testGlobal.web3 = {
  eth: {
    sign: jest.fn((message, address, callback) =>
      callback(null, mockedMessageSignature),
    ),
  },
  currentProvider: {
    publicConfigStore: {
      _events: {
        update: [],
      },
    },
  },
};

/*
 * These values are not correct. Do not use the as reference.
 * If the validators wouldn't be mocked, they wouldn't pass.
 */
const mockedPublicKey = 'recovered-mocked-public-key';
const address = 'mocked-address';
const mockedState = {
  selectedAddress: address,
  networkVersion: 'mocked-selected-chain-id',
};
const mockedNewState = {
  ...mockedState,
  selectedAddress: 'new-mocked-address',
};
const mockedTransactionObject = {
  to: 'mocked-destination-address',
  value: 'mockedValue',
  chainId: 1,
  gasPrice: '1',
  gasLimit: '1',
  nonce: 1,
  inputData: '1',
};
const mockedMessage = 'mocked-message';
const mockedMessageObject = {
  currentAddress: '0xdeaffeed',
  message: mockedMessage,
  messageData: 'data',
};
const mockedSignatureObject = {
  message: mockedMessage,
  signature: 'mocked-signature',
};

describe('Metamask` Wallet Module', () => {
  describe('`MetamaskWallet` class', () => {
    afterEach(() => {
      /*
       * Reset the events update array after each test
       */
      const mockedMetamaskProvider = getInpageProvider();
      /* eslint-disable-next-line no-underscore-dangle */
      mockedMetamaskProvider.publicConfigStore._events.update = [];
      mockedIsEqual.mockClear();
      mockedValidateMetaMaskState.mockClear();
      mockedHexSequenceNormalizer.mockClear();
      mockedHexSequenceValidator.mockClear();
      mockedRecoverPublicKeyHelper.mockClear();
      mockedBufferFrom.mockClear();
    });
    test('Creates a new wallet instance', () => {
      const metamaskWallet = new MetaMaskWallet({
        address,
      });
      /*
       * It should be an instance
       */
      expect(metamaskWallet).toBeInstanceOf(MetaMaskWallet);
    });
    test('Detects the injected proxy before adding the observer', async () => {
      /* eslint-disable-next-line no-new */
      new MetaMaskWallet({ address });
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
    });
    test('Sets the state events change observer', async () => {
      /* eslint-disable-next-line no-new */
      new MetaMaskWallet({ address });
      /*
       * Added the update observer to the events update array
       */
      const mockedMetamaskProvider = getInpageProvider();
      expect(setStateEventObserver).toHaveBeenCalled();
      expect(
        /* eslint-disable-next-line no-underscore-dangle */
        mockedMetamaskProvider.publicConfigStore._events.update,
      ).toHaveLength(1);
    });
    test('Validates the newly changed state', async () => {
      /* eslint-disable-next-line no-new */
      new MetaMaskWallet({ address });
      /*
       * We trigger a state update manually;
       */
      // @ts-ignore
      triggerUpdateStateEvents(mockedState);
      /*
       * Check if the new state is in the correct format
       */
      expect(mockedValidateMetaMaskState).toHaveBeenCalled();
      expect(mockedValidateMetaMaskState).toHaveBeenCalledWith(mockedState);
    });
    test('Deep inspects the state to check for differences', async () => {
      /*
       * Mock it locally so it pretends that the states match
       */
      mockedIsEqual.mockImplementation(() => true);
      /* eslint-disable-next-line no-new */
      new MetaMaskWallet({ address });
      /*
       * We trigger a state update manually;
       */
      // @ts-ignore
      triggerUpdateStateEvents(mockedNewState);
      /*
       * Deep equal the two state objects
       */
      expect(mockedIsEqual).toHaveBeenCalled();
      expect(mockedIsEqual).toHaveBeenCalledWith(undefined, mockedNewState);
    });
    test('Does not update if something goes wrong', async () => {
      /*
       * Locally mocked
       */
      mockedValidateMetaMaskState.mockImplementation(() => {
        throw new Error();
      });
      /* eslint-disable-next-line no-new */
      new MetaMaskWallet({ address });
      /*
       * We trigger a state update manually;
       */
      // @ts-ignore
      const eventsUpdatesArray = triggerUpdateStateEvents(mockedNewState);
      /*
       * At this point we caught, so this will not be called
       */
      expect(mockedIsEqual).not.toHaveBeenCalled();
      /*
       * It returns from the try-catch block
       */
      expect(eventsUpdatesArray[0]).toBeFalsy();
    });
    test('The Wallet Instance has the required (correct) props', () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      /*
       * Address
       */
      expect(metamaskWallet).toHaveProperty('address');
      /*
       * Type and subtyp
       */
      expect(metamaskWallet).toHaveProperty('type', WalletType.Software);
      expect(metamaskWallet).toHaveProperty('subtype', WalletSubType.MetaMask);
      /*
       * `sign()` method
       */
      expect(metamaskWallet).toHaveProperty('sign');
      /*
       * `signMessage()` method
       */
      expect(metamaskWallet).toHaveProperty('signMessage');
      /*
       * `verifyMessage()` method
       */
      expect(metamaskWallet).toHaveProperty('verifyMessage');
    });
    test('Calls the correct method to sign a transaction', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.sign(mockedTransactionObject);
      expect(signTransaction).toHaveBeenCalled();
    });
    test('Validates the input before signing a transaction', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.sign(mockedTransactionObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedTransactionObject,
      });
    });
    test('Sign a transaction without a destination address', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await expect(
        metamaskWallet.sign({ ...mockedTransactionObject, to: undefined }),
      ).resolves.not.toThrow();
    });
    test('Calls the correct method to sign a message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.signMessage(mockedMessageObject);
      expect(signMessage).toHaveBeenCalled();
    });
    test('Validates the input before signing a message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.signMessage(mockedMessageObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedMessageObject,
        requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
      });
    });
    test('Calls the correct method to verify a message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.verifyMessage(mockedSignatureObject);
      expect(verifyMessage).toHaveBeenCalled();
    });
    test('Validates the input before verifying a signature', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.verifyMessage(mockedSignatureObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedSignatureObject,
        requiredAll: REQUIRED_PROPS.VERIFY_MESSAGE,
      });
    });
    test('Normalizes the recovery message and makes it a hex String', () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      metamaskWallet.recoverPublicKey(address);
      /*
       * Normalizes the hex string
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        Buffer.from(PUBLICKEY_RECOVERY_MESSAGE).toString('hex'),
      );
      /*
       * Uses the Buffer class to transform the message into a hex string
       *
       * First it makes it a Buffer instance
       */
      expect(mockedBufferFrom).toHaveBeenCalled();
      expect(mockedBufferFrom).toHaveBeenCalledWith(PUBLICKEY_RECOVERY_MESSAGE);
      /*
       * Then it converts it into a hex string
       */
      expect(mockedBufferToString).toHaveBeenCalled();
      expect(mockedBufferToString).toHaveBeenCalledWith(HEX_HASH_TYPE);
    });
    test('Signs a message (using the UI) to get the signature', () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      metamaskWallet.recoverPublicKey(address);
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
      /*
       * Call's Metamask injected personal sign method
       */
      expect(testGlobal.web3.eth.sign).toHaveBeenCalled();
      expect(testGlobal.web3.eth.sign).toHaveBeenCalledWith(
        Buffer.from(PUBLICKEY_RECOVERY_MESSAGE).toString('hex'),
        address,
        expect.any(Function),
      );
    });
    test('Validates the message signature returned', () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      metamaskWallet.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(mockedMessageSignature);
    });
    test('Recovers the public key from the signature', () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      metamaskWallet.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(mockedRecoverPublicKeyHelper).toHaveBeenCalled();
      expect(mockedRecoverPublicKeyHelper).toHaveBeenCalledWith({
        message: PUBLICKEY_RECOVERY_MESSAGE,
        signature: mockedMessageSignature,
      });
    });
    test('Normalizes the recovered public key before returning', () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      metamaskWallet.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(mockedPublicKey);
    });
    test('Resolves the promise and returns the public key', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await expect(metamaskWallet.recoverPublicKey(address)).resolves.toEqual(
        mockedPublicKey,
      );
    });
    test('Throws if something goes wrong while signing', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      /*
       * Mock it locally to simulate an error
       */
      mockedRecoverPublicKeyHelper.mockImplementationOnce(() => {
        throw new Error('err');
      });
      await expect(metamaskWallet.recoverPublicKey(address)).rejects.toThrow(
        'err',
      );
    });
    test('Warns if the user cancelled signing the message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      /*
       * Mock it locally to simulate the user cancelling the sign message popup
       */
      testGlobal.web3.eth.sign.mockImplementationOnce(
        (message, currentAddress, callback) =>
          callback(
            new Error(STD_ERRORS.CANCEL_MSG_SIGN),
            mockedMessageSignature,
          ),
      );
      /*
       * Mock it locally so we can test the return
       */
      mockedWarning.mockImplementationOnce(() => STD_ERRORS.CANCEL_MSG_SIGN);
      const cancelledMessageSign = metamaskWallet.recoverPublicKey(address);
      /*
       * It doesn't throw
       */
      await expect(cancelledMessageSign).resolves.not.toThrow();
      /*
       * It warns the user
       */
      expect(mockedWarning).toHaveBeenCalled();
      await expect(cancelledMessageSign).resolves.toEqual(
        STD_ERRORS.CANCEL_MSG_SIGN,
      );
    });
    test('Returns the public key getter by signing a message', async () => {
      const metamaskWallet = new MetaMaskWallet({
        address: 'some weird address',
      });
      // @ts-ignore
      triggerUpdateStateEvents(mockedNewState);
      const publicKey = await metamaskWallet.getPublicKey();
      expect(testGlobal.web3.eth.sign).toHaveBeenCalled();
      expect(publicKey).toEqual(mockedPublicKey);
    });
  });
});
