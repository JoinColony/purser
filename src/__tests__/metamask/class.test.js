import isEqual from 'lodash.isequal';

import { warning } from '../../core/utils';
import { hexSequenceNormalizer } from '../../core/normalizers';
import { hexSequenceValidator } from '../../core/validators';
import { recoverPublicKey as recoverPublicKeyHelper } from '../../core/helpers';
import { TYPE_SOFTWARE, SUBTYPE_METAMASK } from '../../core/types';
import { HEX_HASH_TYPE } from '../../core/defaults';

import MetamaskWalletClass from '../../metamask/class';
import {
  methodCaller,
  getInpageProvider,
  setStateEventObserver,
  /*
   * This method exists only in the mocked helpers file.
   * It helps us trigger an event update
   */
  /* eslint-disable-next-line import/named */
  triggerUpdateStateEvents,
} from '../../metamask/helpers';
import { validateMetamaskState } from '../../metamask/validators';
import {
  PUBLICKEY_RECOVERY_MESSAGE,
  STD_ERRORS,
} from '../../metamask/defaults';

jest.dontMock('../../metamask/class');

jest.mock('lodash.isequal');
jest.mock('../../core/utils');
jest.mock('../../core/validators');
jest.mock('../../core/normalizers');
jest.mock('../../core/helpers');

/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../metamask/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../metamask/__remocks__/helpers'),
);
jest.mock('../../metamask/validators', () =>
  /* eslint-disable-next-line global-require */
  require('../../metamask/__remocks__/validators'),
);

const mockedMessageSignature = 'mocked-message-signature';
const callbackError = { message: 'no-error-here' };
/*
 * Mock the injected web3 proxy object
 */
global.web3 = {
  personal: {
    sign: jest.fn((message, address, callback) =>
      callback(callbackError, mockedMessageSignature),
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
 * Mock the Buffer global object
 */
const mockedToString = jest.fn(function mockedToString() {
  return this;
});
global.Buffer = {
  from: jest.fn(value => ({
    toString: mockedToString.bind(value),
  })),
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

describe('Metamask` Wallet Module', () => {
  describe('`MetamaskWallet` class', () => {
    afterEach(() => {
      /*
       * Reset the events update array after each test
       */
      const mockedMetamaskProvider = getInpageProvider();
      /* eslint-disable-next-line no-underscore-dangle */
      mockedMetamaskProvider.publicConfigStore._events.update = [];
      isEqual.mockClear();
      validateMetamaskState.mockClear();
      hexSequenceNormalizer.mockClear();
      hexSequenceValidator.mockClear();
      recoverPublicKeyHelper.mockClear();
      global.Buffer.from.mockClear();
    });
    test('Creates a new wallet instance', () => {
      const metamaskWallet = new MetamaskWalletClass({
        address,
      });
      /*
       * It should be an instance
       */
      expect(metamaskWallet).toBeInstanceOf(MetamaskWalletClass);
    });
    test('Detects the injected proxy before adding the observer', async () => {
      /* eslint-disable-next-line no-new */
      new MetamaskWalletClass({ address });
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
    });
    test('Sets the state events change observer', async () => {
      /* eslint-disable-next-line no-new */
      new MetamaskWalletClass({ address });
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
      new MetamaskWalletClass({ address });
      /*
       * We trigger a state update manually;
       */
      triggerUpdateStateEvents(mockedState);
      /*
       * Check if the new state is in the correct format
       */
      expect(validateMetamaskState).toHaveBeenCalled();
      expect(validateMetamaskState).toHaveBeenCalledWith(mockedState);
    });
    test('Deep inspects the state to check for differences', async () => {
      /*
       * Mock it locally so it pretends that the states match
       */
      isEqual.mockImplementation(() => true);
      /* eslint-disable-next-line no-new */
      new MetamaskWalletClass({ address });
      /*
       * We trigger a state update manually;
       */
      triggerUpdateStateEvents(mockedNewState);
      /*
       * Deep equal the two state objects
       */
      expect(isEqual).toHaveBeenCalled();
      expect(isEqual).toHaveBeenCalledWith(mockedState, mockedNewState);
    });
    test('Does not update if something goes wrong', async () => {
      /*
       * Locally mocked
       */
      validateMetamaskState.mockImplementation(() => {
        throw new Error();
      });
      /* eslint-disable-next-line no-new */
      new MetamaskWalletClass({ address });
      /*
       * We trigger a state update manually;
       */
      const eventsUpdatesArray = triggerUpdateStateEvents(mockedNewState);
      /*
       * At this point we caught, so this will not be called
       */
      expect(isEqual).not.toHaveBeenCalled();
      /*
       * It returns from the try-catch block
       */
      expect(eventsUpdatesArray[0]).toBeFalsy();
    });
    test('The Wallet Instance has the required (correct) props', () => {
      const metamaskWallet = new MetamaskWalletClass({ address });
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
      expect(metamaskWallet).toHaveProperty('type', TYPE_SOFTWARE);
      expect(metamaskWallet).toHaveProperty('subtype', SUBTYPE_METAMASK);
    });
    test('Normalizes the recovery message and makes it a hex String', () => {
      MetamaskWalletClass.recoverPublicKey(address);
      /*
       * Normalizes the hex string
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        PUBLICKEY_RECOVERY_MESSAGE,
      );
      /*
       * Uses the Buffer class to transform the message into a hex string
       *
       * First it makes it a Buffer instance
       */
      expect(global.Buffer.from).toHaveBeenCalled();
      expect(global.Buffer.from).toHaveBeenCalledWith(
        PUBLICKEY_RECOVERY_MESSAGE,
      );
      /*
       * Then it converts it into a hex string
       */
      expect(mockedToString).toHaveBeenCalled();
      expect(mockedToString).toHaveBeenCalledWith(HEX_HASH_TYPE);
    });
    test('Signs a message (using the UI) to get the signature', () => {
      MetamaskWalletClass.recoverPublicKey(address);
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
      /*
       * Call's Metamask injected personal sign method
       */
      expect(global.web3.personal.sign).toHaveBeenCalled();
      expect(global.web3.personal.sign).toHaveBeenCalledWith(
        PUBLICKEY_RECOVERY_MESSAGE,
        address,
        expect.any(Function),
      );
    });
    test('Validates the message signature returned', () => {
      MetamaskWalletClass.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(hexSequenceValidator).toHaveBeenCalled();
      expect(hexSequenceValidator).toHaveBeenCalledWith(mockedMessageSignature);
    });
    test('Recovers the public key from the signature', () => {
      MetamaskWalletClass.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(recoverPublicKeyHelper).toHaveBeenCalled();
      expect(recoverPublicKeyHelper).toHaveBeenCalledWith({
        message: PUBLICKEY_RECOVERY_MESSAGE,
        signature: mockedMessageSignature,
      });
    });
    test('Normalizes the recovered public key before returning', () => {
      MetamaskWalletClass.recoverPublicKey(address);
      /*
       * Validates the signature
       */
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(mockedPublicKey);
    });
    test('Resolves the promise and returns the public key', () => {
      expect(MetamaskWalletClass.recoverPublicKey(address)).resolves.toEqual(
        mockedPublicKey,
      );
    });
    test('Throws if something goes wrong while signing', async () => {
      /*
       * Mock it locally to simulate an error
       */
      recoverPublicKeyHelper.mockImplementation(() => {
        throw new Error();
      });
      expect(MetamaskWalletClass.recoverPublicKey(address)).rejects.toThrow();
    });
    test('Warns if the user cancelled signing the message', async () => {
      /*
       * Mock it locally to simulate an error
       */
      recoverPublicKeyHelper.mockImplementation(() => {
        throw new Error();
      });
      /*
       * Mock it locally to simulate the user cancelling the sign message popup
       */
      global.web3.personal.sign.mockImplementation(
        (message, currentAddress, callback) =>
          callback(
            { ...callbackError, message: STD_ERRORS.CANCEL_MSG_SIGN },
            mockedMessageSignature,
          ),
      );
      /*
       * Mock it locally so we can test the return
       */
      warning.mockImplementation(() => STD_ERRORS.CANCEL_MSG_SIGN);
      const cancelledMessageSign = MetamaskWalletClass.recoverPublicKey(
        address,
      );
      /*
       * It doesn't throw
       */
      expect(cancelledMessageSign).resolves.not.toThrow();
      /*
       * It warns the user
       */
      expect(warning).toHaveBeenCalled();
      expect(cancelledMessageSign).resolves.toEqual(STD_ERRORS.CANCEL_MSG_SIGN);
    });
    test('Returns the public key getter by signing a message', async () => {
      const metamaskWallet = new MetamaskWalletClass({
        address: 'some weird address',
      });
      triggerUpdateStateEvents(mockedNewState);
      const publicKey = await metamaskWallet.publicKey;
      expect(global.web3.personal.sign).toHaveBeenCalled();
      expect(publicKey).toEqual(mockedPublicKey);
    });
  });
});
