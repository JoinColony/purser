import isEqual from 'lodash.isequal';

import { jestMocked } from '../../testutils';

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
  triggerUpdateStateEvents,
} from '../src/helpers';
import { validateMetaMaskState } from '../src/validators';
import {
  signTransaction,
  signMessage,
  verifyMessage,
} from '../src/staticMethods';
import { PUBLICKEY_RECOVERY_MESSAGE, STD_ERRORS } from '../src/constants';

jest.mock('lodash.isequal');
jest.mock('../../purser-core/src/validators');
jest.mock('../../purser-core/src/helpers');
jest.mock('../../purser-core/src/normalizers');
jest.mock('../../purser-core/src/utils');
jest.mock('../src/staticMethods');
jest.mock('../src/helpers');
jest.mock('../src/validators');

const mockedIsEqual = jestMocked(isEqual);
const mockedValidateMetaMaskState = jestMocked(validateMetaMaskState);
const mockedHexSequenceNormalizer = jestMocked(hexSequenceNormalizer);
const mockedHexSequenceValidator = jestMocked(hexSequenceValidator);
const mockedRecoverPublicKeyHelper = jestMocked(recoverPublicKeyHelper);
const mockedWarning = jestMocked(warning);
const mockedBufferFrom = jest.spyOn(Buffer, 'from');
const mockedBufferToString = jest.spyOn(Buffer.prototype, 'toString');

const mockedMessageSignature = 'mocked-message-signature';
const callbackError = { message: 'no-error-here' };

const anyGlobal: any = global;

/*
 * Mock the injected web3 proxy object
 */
anyGlobal.web3 = {
  eth: {
    personal: {
      sign: jest.fn((message, address, callback) =>
        callback(callbackError, mockedMessageSignature),
      ),
    },
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
};
const mockedMessage = 'mocked-message';
const mockeMessageObject = {
  message: mockedMessage,
};
const mockeSignatureObject = {
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
      triggerUpdateStateEvents(mockedNewState);
      /*
       * Deep equal the two state objects
       */
      expect(mockedIsEqual).toHaveBeenCalled();
      expect(mockedIsEqual).toHaveBeenCalledWith(mockedState, mockedNewState);
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
       * Public Key
       */
      expect(metamaskWallet).toHaveProperty('publicKey');
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
      await metamaskWallet.sign();
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
      expect(
        metamaskWallet.sign({
          value: 'mockedValue',
        }),
      ).resolves.not.toThrow();
    });
    test('Calls the correct method to sign a message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.signMessage();
      expect(signMessage).toHaveBeenCalled();
    });
    test('Validates the input before signing a message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.signMessage(mockeMessageObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockeMessageObject,
        requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
      });
    });
    test('Calls the correct method to verify a message', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.verifyMessage();
      expect(verifyMessage).toHaveBeenCalled();
    });
    test('Validates the input before verifying a signature', async () => {
      const metamaskWallet = new MetaMaskWallet({ address });
      await metamaskWallet.verifyMessage(mockeSignatureObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockeSignatureObject,
        requiredAll: REQUIRED_PROPS.VERIFY_MESSAGE,
      });
    });
    test('Normalizes the recovery message and makes it a hex String', () => {
      MetaMaskWallet.recoverPublicKey(address);
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
      MetaMaskWallet.recoverPublicKey(address);
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
      /*
       * Call's Metamask injected personal sign method
       */
      expect(anyGlobal.web3.eth.personal.sign).toHaveBeenCalled();
      expect(anyGlobal.web3.eth.personal.sign).toHaveBeenCalledWith(
        Buffer.from(PUBLICKEY_RECOVERY_MESSAGE).toString('hex'),
        address,
        expect.any(Function),
      );
    });
    test('Validates the message signature returned', () => {
      MetaMaskWallet.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(mockedMessageSignature);
    });
    test('Recovers the public key from the signature', () => {
      MetaMaskWallet.recoverPublicKey(address);
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
      MetaMaskWallet.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(mockedPublicKey);
    });
    test('Resolves the promise and returns the public key', () => {
      expect(MetaMaskWallet.recoverPublicKey(address)).resolves.toEqual(
        mockedPublicKey,
      );
    });
    test('Throws if something goes wrong while signing', async () => {
      /*
       * Mock it locally to simulate an error
       */
      mockedRecoverPublicKeyHelper.mockImplementation(() => {
        throw new Error();
      });
      expect(MetaMaskWallet.recoverPublicKey(address)).rejects.toThrow();
    });
    test('Warns if the user cancelled signing the message', async () => {
      /*
       * Mock it locally to simulate an error
       */
      mockedRecoverPublicKeyHelper.mockImplementation(() => {
        throw new Error();
      });
      /*
       * Mock it locally to simulate the user cancelling the sign message popup
       */
      anyGlobal.web3.eth.personal.sign.mockImplementation(
        (message, currentAddress, callback) =>
          callback(
            { ...callbackError, message: STD_ERRORS.CANCEL_MSG_SIGN },
            mockedMessageSignature,
          ),
      );
      /*
       * Mock it locally so we can test the return
       */
      mockedWarning.mockImplementation(() => STD_ERRORS.CANCEL_MSG_SIGN);
      const cancelledMessageSign = MetaMaskWallet.recoverPublicKey(address);
      /*
       * It doesn't throw
       */
      expect(cancelledMessageSign).resolves.not.toThrow();
      /*
       * It warns the user
       */
      expect(mockedWarning).toHaveBeenCalled();
      expect(cancelledMessageSign).resolves.toEqual(STD_ERRORS.CANCEL_MSG_SIGN);
    });
    test('Returns the public key getter by signing a message', async () => {
      const metamaskWallet = new MetaMaskWallet({
        address: 'some weird address',
      });
      triggerUpdateStateEvents(mockedNewState);
      const publicKey = await metamaskWallet.publicKey;
      expect(anyGlobal.web3.eth.personal.sign).toHaveBeenCalled();
      expect(publicKey).toEqual(mockedPublicKey);
    });
  });
});
