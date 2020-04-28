import { hashPersonalMessage, ecrecover } from 'ethereumjs-util';
import Common from 'ethereumjs-common';
import { TransactionOptions } from 'ethereumjs-tx';

import {
  safeIntegerValidator,
  bigNumberValidator,
  addressValidator,
  hexSequenceValidator,
  messageValidator,
  messageDataValidator,
} from './validators';
import { hexSequenceNormalizer, recoveryParamNormalizer } from './normalizers';
import { bigNumber, warning } from './utils';

import { helpers as helperMessages } from './messages';
import {
  CHAIN_IDS,
  HARDFORKS,
  HEX_HASH_TYPE,
  NETWORK_NAMES,
  PATH,
  TRANSACTION,
} from './constants';

import {
  DerivationPathObjectType,
  MessageVerificationObjectType,
  TransactionObjectTypeWithTo,
} from './types';

/**
 * Serialize an derivation path object's props into it's string counterpart
 *
 * @method derivationPathSerializer
 *
 * @param {number} purpose path purpose
 * @param {number} coinType path coin type (and network)
 * @param {number} account path account number
 * @param {number} change path change number
 * @param {number} addressIndex address index (no default since it should be manually added)
 *
 * See the defaults file for some more information regarding the format of the
 * Ethereum deviation path.
 *
 * All the above params are sent in as props of an {DerivationPathObjectType} object.
 *
 * @return {string} The serialized path
 */
export const derivationPathSerializer = ({
  purpose = PATH.PURPOSE,
  coinType = PATH.COIN_MAINNET,
  account = PATH.ACCOUNT,
  change,
  addressIndex,
}: DerivationPathObjectType = {}): string => {
  const { DELIMITER } = PATH;
  const hasChange = change || change === 0;
  const hasAddressIndex = addressIndex || addressIndex === 0;
  return `${
    `${PATH.HEADER_KEY}/${purpose}` +
    `${DELIMITER}${coinType}` +
    `${DELIMITER}${account}` +
    `${DELIMITER}` +
    `${hasChange ? change : ''}`
  }${hasChange && hasAddressIndex ? `/${addressIndex}` : ''}`;
};

/**
 * Recover a public key from a message and the signature of that message.
 *
 * @NOTE Further optimization
 *
 * This can be further optimized by writing our own recovery mechanism since we already
 * do most of the cleanup, checking and coversions.
 *
 * All that is left to do is to use `secp256k1` to convert and recover the public key
 * from the signature points (components).
 *
 * But since most of our dependencies already use `ethereumjs-util` under the hood anyway,
 * it's easier just use it as well.
 *
 * @method recoverPublicKey
 *
 * @param {string} message The message string to hash for the signature verification procedure
 * @param {string} signature The signature to recover the private key from, as a `hex` string
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {String} The recovered public key.
 */
export const recoverPublicKey = ({
  message,
  signature,
}: MessageVerificationObjectType): string => {
  const signatureBuffer = Buffer.from(
    hexSequenceNormalizer(signature.toLowerCase(), false),
    HEX_HASH_TYPE,
  );

  const messages = helperMessages.verifyMessageSignature;
  /*
   * It should be 65 bits in legth:
   * - 32 for the (R) point (component)
   * - 32 for the (S) point (component)
   * - 1 for the reco(V)ery param
   */
  if (signatureBuffer.length !== 65) {
    throw new Error(messages.wrongLength);
  }
  /*
   * The recovery param is the the 64th bit of the signature Buffer
   */
  const recoveryParam = recoveryParamNormalizer(signatureBuffer[64]);
  const rComponent = signatureBuffer.slice(0, 32);
  const sComponent = signatureBuffer.slice(32, 64);
  const messageHash = hashPersonalMessage(Buffer.from(message));
  /*
   * Elliptic curve recovery.
   *
   * @NOTE `ecrecover` is just a helper method
   * Around `secp256k1`'s `recover()` and `publicKeyConvert()` methods
   *
   * This is to what the function description comment block note is referring  to
   */
  const recoveredPublicKeyBuffer = ecrecover(
    messageHash,
    recoveryParam,
    rComponent,
    sComponent,
  );
  /*
   * Normalize and return the recovered public key
   */
  return hexSequenceNormalizer(
    recoveredPublicKeyBuffer.toString(HEX_HASH_TYPE),
  );
};

/**
 * Verify a signed message.
 * By extracting it's public key from the signature and comparing it with a provided one.
 *
 * @method verifyMessageSignature
 *
 * @param {string} publicKey Public key to check against, as a 'hex' string
 * @param {string} message The message string to hash for the signature verification procedure
 * @param {string} signature The signature to recover the private key from, as a `hex` string
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {boolean} true or false depending if the signature is valid or not
 *
 */
export const verifyMessageSignature = ({
  publicKey,
  message,
  signature,
}): boolean => {
  const { verifyMessageSignature: messages } = helperMessages;
  try {
    /*
     * Normalize the recovered public key by removing the `0x` preifx
     */
    const recoveredPublicKey: string = hexSequenceNormalizer(
      recoverPublicKey({ message, signature }),
      false,
    );
    /*
     * Remove the prefix (0x) and the header (first two bits) from the public key we
     * want to test against
     */
    const normalizedPublicKey: string = hexSequenceNormalizer(
      publicKey,
      false,
    ).slice(2);
    /*
     * Last 64 bits of the private should match the first 64 bits of the recovered public key
     */
    return !!recoveredPublicKey.includes(normalizedPublicKey);
  } catch (caughtError) {
    warning(`${messages.somethingWentWrong}. Error: ${caughtError.message}`, {
      level: 'high',
    });
    return false;
  }
};

/**
 * Validate an transaction object
 *
 * @NOTE We can only validate here, we can't also normalize. This is because different
 * wallet types expect different value formats so we must normalize them on a case by case basis.
 *
 * @method transactionObjectValidator
 *
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} chainId the id of the chain for which this transaction is intended. Defaults to 1
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to the transaction is sent
 * @param {bigNumber} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} inputData data appended to the transaction (as a `hex` string)
 *
 * All the above params are sent in as props of an {TransactionObjectType} object.
 *
 * @return {TransactionObjectType} The validated transaction object containing the exact passed in values
 */

export const transactionObjectValidator = (
  {
    gasPrice = bigNumber(TRANSACTION.GAS_PRICE).toString(),
    gasLimit = bigNumber(TRANSACTION.GAS_LIMIT).toString(),
    chainId = TRANSACTION.CHAIN_ID,
    nonce = TRANSACTION.NONCE,
    to,
    value = bigNumber(TRANSACTION.VALUE).toString(),
    inputData = TRANSACTION.INPUT_DATA,
  }: TransactionObjectTypeWithTo = {
    gasPrice: bigNumber(TRANSACTION.GAS_PRICE).toString(),
    gasLimit: bigNumber(TRANSACTION.GAS_LIMIT).toString(),
    chainId: TRANSACTION.CHAIN_ID,
    nonce: TRANSACTION.NONCE,
    to: undefined,
    value: bigNumber(TRANSACTION.VALUE).toString(),
    inputData: TRANSACTION.INPUT_DATA,
  },
): TransactionObjectTypeWithTo => {
  /*
   * Check that the gas price is a big number
   */
  bigNumberValidator(gasPrice);
  /*
   * Check that the gas limit is a big number
   */
  bigNumberValidator(gasLimit);
  /*
   * Check if the chain id value is valid (a positive, safe integer)
   */
  safeIntegerValidator(chainId);
  /*
   * Check if the nonce value is valid (a positive, safe integer)
   */
  safeIntegerValidator(nonce);
  /*
   * Only check if the address (`to` prop) is in the correct
   * format, if one was provided in the initial transaction object
   */
  if (to) {
    addressValidator(to);
  }
  /*
   * Check that the value is a big number
   */
  bigNumberValidator(value);
  /*
   * Check that the input data prop is a valid hex string sequence
   */
  hexSequenceValidator(inputData);
  /*
   * Normalize the values and return them
   */
  return {
    gasPrice,
    gasLimit,
    chainId,
    nonce,
    to,
    value,
    inputData,
  };
};

/**
 * Validate a signature verification message object
 *
 * @method messageVerificationObjectValidator
 *
 * @param {string} message The message string to check the signature against
 * @param {string} signature The signature of the message.
 *
 * All the above params are sent in as props of an {MessageVerificationObjectType} object.
 *
 * @return {Object} The validated signature object containing the exact passed in values
 */
export const messageVerificationObjectValidator = ({
  /*
   * For the Ledger wallet implementation we can't pass in an empty string, so
   * we try with the next best thing.
   */
  message,
  signature,
}: MessageVerificationObjectType): MessageVerificationObjectType => {
  /*
   * Check if the messages is in the correct format
   */
  messageValidator(message);
  /*
   * Check if the signature is in the correct format
   */
  hexSequenceValidator(signature);
  return {
    message,
    /*
     * Ensure the signature has the hex `0x` prefix
     */
    signature: hexSequenceNormalizer(signature),
  };
};

/**
 * Check if the user provided input is in the form of an Object and it's required props
 *
 * @method userInputValidator
 *
 * @param {Object} firstArgument The argument to validate that it's indeed an object, and that it has the required props
 * @param {Array} requiredEither Array of strings representing prop names of which at least one is required.
 * @param {Array} requiredAll Array of strings representing prop names of which all are required.
 *
 * All the above params are sent in as props of an object.
 */

export const userInputValidator = ({
  firstArgument = {},
  requiredEither = [],
  requiredAll = [],
  requiredOr = [],
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  firstArgument?: Record<string, any>;
  requiredEither?: Array<string>;
  requiredAll?: Array<string>;
  requiredOr?: Array<string>;
} = {}): void => {
  const { userInputValidator: messages } = helperMessages;
  /*
   * First we check if the argument is an Object (also, not an Array)
   */
  if (typeof firstArgument !== 'object' || Array.isArray(firstArgument)) {
    /*
     * Explain the arguments format (if we're in dev mode), then throw the Error
     */
    warning(messages.argumentsFormatExplanation);
    throw new Error(messages.notObject);
  }
  /*
   * Check if some of the required props are available
   * Fail if none are available.
   */
  if (requiredEither && requiredEither.length) {
    const availableProps: Array<boolean> = requiredEither.map((propName) =>
      Object.prototype.hasOwnProperty.call(firstArgument, propName),
    );
    if (!availableProps.some((propExists) => propExists === true)) {
      /*
       * Explain the arguments format (if we're in dev mode), then throw the Error
       */
      warning(messages.argumentsFormatExplanation);
      throw new Error(
        `${messages.notSomeProps}: { '${requiredEither.join(`', '`)}' }`,
      );
    }
  }
  /*
   * Check if all required props are present.
   * Fail after the first one missing.
   */
  if (requiredAll) {
    requiredAll.map((propName) => {
      if (!Object.prototype.hasOwnProperty.call(firstArgument, propName)) {
        /*
         * Explain the arguments format (if we're in dev mode), then throw the Error
         */
        warning(messages.argumentsFormatExplanation);
        throw new Error(
          `${messages.notAllProps}: { '${requiredAll.join(`', '`)}' }`,
        );
      }
      return propName;
    });
  }

  /*
   * Check if exactly one of the required props is present.
   * Fail if multiple are present.
   */
  if (
    requiredOr &&
    requiredOr.length &&
    requiredOr.reduce(
      (acc, propName) =>
        Object.prototype.hasOwnProperty.call(firstArgument, propName)
          ? acc + 1
          : acc,
      0,
    ) !== 1
  ) {
    warning(messages.argumentsFormatExplanation);
    throw new Error();
  }
};

export const messageOrDataValidator = ({
  message,
  messageData,
}: {
  message: string;
  messageData: string | Uint8Array;
}): string | Uint8Array => {
  if (message) {
    messageValidator(message);
    return message;
  }
  messageDataValidator(messageData);
  return typeof messageData === 'string'
    ? new Uint8Array(
        Buffer.from(hexSequenceNormalizer(messageData, false), 'hex'),
      )
    : messageData;
};

/**
 * In order to support EIP-155, it's necessary to specify various
 * definitions for a given chain (e.g. the chain ID, network ID, hardforks).
 *
 * Given a chain ID, this function returns a chain definition in the format
 * expected by `ethereumjs-tx`.
 *
 * @param {number} chainId The given chain ID (as defined in EIP-155)
 * @return {Object} The common chain definition
 */
export const getChainDefinition = (chainId: number): TransactionOptions => {
  let baseChain: string;

  switch (chainId) {
    /*
     * Ganache's default chain ID is 1337, and is also the standard for
     * private chains. The assumption is taken here that this inherits
     * all of the other properties from mainnet, but that might not be
     * the case.
     *
     * @TODO Provide a means to specify all chain properties for transactions
     */
    case CHAIN_IDS.HOMESTEAD:
    case CHAIN_IDS.LOCAL: {
      baseChain = NETWORK_NAMES.MAINNET;
      break;
    }
    case CHAIN_IDS.GOERLI: {
      baseChain = NETWORK_NAMES.GOERLI;
      break;
    }
    /*
     * The following (or other) chain IDs _may_ cause validation errors
     * in `ethereumjs-common`
     */
    case CHAIN_IDS.KOVAN: {
      baseChain = NETWORK_NAMES.KOVAN;
      break;
    }
    case CHAIN_IDS.ROPSTEN: {
      baseChain = NETWORK_NAMES.ROPSTEN;
      break;
    }
    case CHAIN_IDS.RINKEBY: {
      baseChain = NETWORK_NAMES.RINKEBY;
      break;
    }
    default: {
      baseChain = chainId.toString();
    }
  }
  return {
    common: Common.forCustomChain(
      baseChain,
      { chainId },
      /*
       * `ethereumjs-common` requires a hardfork to be defined, so we are
       * using the current default for this property. This is also an
       * assumption, and this should be made configurable.
       */
      HARDFORKS.PETERSBURG,
    ),
  };
};
