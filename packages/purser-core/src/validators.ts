

import BN from 'bn.js';

import { assertTruth, validatorGenerator, objectToErrorString } from './utils';
import { validators as messages } from './messages';
import { PATH, MATCH, UNDEFINED, SPLITTER } from './defaults';

/**
 * Validate a derivation path passed in as a string
 *
 * @method derivationPathValidator
 *
 * @param {string} derivationPath The derivation path to check
 *
 * @return {boolean} It only returns true if the derivation path is correct,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const derivationPathValidator = (derivationPath: string): boolean => {
  const { derivationPath: derivationPathMessages } = messages;
  const { COIN_MAINNET, COIN_TESTNET } = PATH;
  let deSerializedDerivationPath: Array<string>;
  let coinType: number;
  try {
    /*
     * Because assignments get bubbled to the top of the method, we need to wrap
     * this inside a try/catch block.
     *
     * Otherwise, this will fail before we have a change to assert it.
     */
    deSerializedDerivationPath = derivationPath.split(PATH.DELIMITER);
    coinType = parseInt(deSerializedDerivationPath[1], 10);
  } catch (caughtError) {
    throw new Error(
      `${derivationPathMessages.notString}: ${derivationPath || UNDEFINED}`,
    );
  }
  /*
   * We need to assert this in a separate step, otherwise, if the size of the split
   * chunks is not correct the `match()` method call will fail before the
   * validator generator sequence will actually start.
   */
  assertTruth({
    /*
     * It should be composed of (at least) four parts
     * (purpouse, coin, account, change and/or index)
     */
    expression: deSerializedDerivationPath.length === 4,
    message: [
      `${derivationPathMessages.notValidParts}: [`,
      ...deSerializedDerivationPath,
      ']',

    ],
    level: 'high'
  })
  const validationSequence = [
    {
      /*
       * It should have the correct Header Key (the letter 'm')
       */
      expression:
        deSerializedDerivationPath[0].split(SPLITTER)[0].toLowerCase() ===
        PATH.HEADER_KEY,
      message: [
        `${derivationPathMessages.notValidHeaderKey}:`,
        deSerializedDerivationPath[0] || UNDEFINED,
      ],
    },
    {
      /*
       * It should have the Ethereum reserved Purpouse (44)
       */
      expression:
        parseInt(deSerializedDerivationPath[0].split(SPLITTER)[1], 10) ===
        PATH.PURPOSE,
      message: [
        `${derivationPathMessages.notValidPurpouse}:`,
        deSerializedDerivationPath[0] || UNDEFINED,
      ],
    },
    {
      /*
       * It should have the correct Coin type
       */
      expression: coinType === COIN_MAINNET || coinType === COIN_TESTNET,
      message: [
        `${derivationPathMessages.notValidCoin}:`,
        deSerializedDerivationPath[1] || UNDEFINED,
      ],
    },
    {
      /*
       * It should have the correct Account format (eg: a number)
       */
      expression: !!deSerializedDerivationPath[2].match(MATCH.DIGITS),
      message: [
        `${derivationPathMessages.notValidAccount}:`,
        deSerializedDerivationPath[2] || UNDEFINED,
      ],
    },
    {
      /*
       * It should have the correct Change and/or Account Index format (eg: a number)
       */
      expression: deSerializedDerivationPath[3]
        .split(SPLITTER)
        .map(value => !!value.match(MATCH.DIGITS))
        .every(truth => truth !== false),
      message: [
        `${derivationPathMessages.notValidChangeIndex}:`,
        deSerializedDerivationPath[3] || UNDEFINED,
      ],
    },
    {
      /*
       * It should have the correct amount of Account Indexed (just one)
       */
      expression: deSerializedDerivationPath[3].split(SPLITTER).length <= 2,
      message: [
        `${derivationPathMessages.notValidAccountIndex}:`,
        deSerializedDerivationPath[3] || UNDEFINED,
      ],
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${derivationPathMessages.genericError}: ${derivationPath || UNDEFINED}`,
  );
};

/**
 * Validate an integer passed in to make sure is safe (< 9007199254740991) and positive
 *
 * @method safeIntegerValidator
 *
 * @param {number} integer The integer to validate
 *
 * @return {boolean} It only returns true if the integer is safe and positive,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const safeIntegerValidator = (integer: number): boolean => {
  const { safeInteger: safeIntegerMessages } = messages;
  const validationSequence = [
    {
      /*
       * It should be a number primitive
       */
      expression: typeof integer === 'number',
      message: `${safeIntegerMessages.notNumber}: ${integer}`,
    },
    {
      /*
       * It should be a positive number
       * This is a little less trutfull as integers can also be negative
       */
      expression: integer >= 0,
      message: `${safeIntegerMessages.notPositive}: ${integer}`,
    },
    {
      /*
       * It should be under the safe integer limit: ± 9007199254740991
       * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
       */
      expression: Number.isSafeInteger(integer),
      message: `${safeIntegerMessages.notSafe}: ${integer}`,
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${safeIntegerMessages.genericError}: ${integer}`,
  );
};

/**
 * Validate a Big Number instance object that was passed in
 *
 * @method bigNumberValidator
 *
 * @param {any} bigNumber The big number instance to check
 *
 * @return {boolean} It only returns true if the object is an instance of Big Number,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const bigNumberValidator = (bigNumber: any): boolean => {
  const { bigNumber: bigNumberMessages } = messages;
  const validationSequence = [
    {
      /*
       * It should be an instance of the BN Class
       */
      expression: BN.isBN(bigNumber),
      message: `${bigNumberMessages.notBigNumber}: ${objectToErrorString(
        bigNumber,
      )}`,
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${bigNumberMessages.genericError}: ${objectToErrorString(bigNumber)}`,
  );
};

/**
 * Validate a BIP32 Ethereum Address
 *
 * @TODO Validate the checksum of the address.
 *
 * @method addressValidator
 *
 * @param {string} address The 'hex' address to check
 *
 * @return {boolean} It only returns true if the string is a valid address format,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const addressValidator = (address: string): boolean => {
  const { address: addressMessages } = messages;
  let addressLength = 0;
  try {
    /*
     * Because length checking is bubbled to the top, we need to to wrap this inside
     * a separate try-catch block, otherwise the whole thing will fail before the
     * validation sequence will even start.
     */
    addressLength = address.length;
  } catch (caughtError) {
    throw new Error(`${addressMessages.notStringSequence}: ${UNDEFINED}`);
  }
  const validationSequence = [
    {
      /*
      * It should be a string
      */
      expression: typeof address === 'string',
      message: `${addressMessages.notStringSequence}: ${objectToErrorString(
        address,
      ) || UNDEFINED}`,
    },
    {
      /*
      * It should be the correct length. Either 40 or 42 (with prefix)
      */
      expression: addressLength === 40 || addressLength === 42,
      message: `${addressMessages.notLength}: ${address || UNDEFINED}`,
    },
    {
      /*
       * It should be in the correct format (hex string of length 40 with or
       * with out the `0x` prefix)
       */
      expression: !!address.match(MATCH.ADDRESS),
      message: `${addressMessages.notFormat}: ${address || UNDEFINED}`,
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${addressMessages.genericError}: ${address || UNDEFINED}`,
  );
};

/**
 * Validate a hex string
 *
 * @method hexSequenceValidator
 *
 * @param {string} hexSequence The `hex` string to check
 *
 * @return {boolean} It only returns true if the string is a valid hex format,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const hexSequenceValidator = (hexSequence: string): boolean => {
  const { hexSequence: hexSequenceMessages } = messages;
  const validationSequence = [
    {
      /*
      * It should be a string
      */
      expression: typeof hexSequence === 'string',
      message: `${hexSequenceMessages.notStringSequence}: ${objectToErrorString(
        hexSequence,
      ) || UNDEFINED}`,
    },
    {
      /*
      * It should be in the correct format (hex string with or with out the `0x` prefix)
      */
      expression: !!hexSequence.match(MATCH.HEX_STRING),
      message: `${hexSequenceMessages.notFormat}: ${hexSequence || UNDEFINED}`,
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${hexSequenceMessages.genericError}: ${hexSequence || UNDEFINED}`,
  );
};

/**
 * Validate a hex string
 *
 * @method messageValidator
 *
 * @param {string} string The big number instance to check
 *
 * @return {boolean} It only returns true if the string is a valid format,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const messageValidator = (string: string): boolean => {
  /*
   * Real creative naming there, huh...?
   */
  const { message: messageMessages } = messages;
  const validationSequence = [
    {
      /*
      * It should be a string
      */
      expression: typeof string === 'string',
      message: `${messageMessages.notString}: ${objectToErrorString(string) ||
        UNDEFINED}`,
    },
    {
      /*
      * It should be under (or equal to) 1024 Bytes in size
      */
      expression: string.length <= 1024,
      message: `${messageMessages.tooBig}: ${string || UNDEFINED}`,
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${messageMessages.genericError}: ${string || UNDEFINED}`,
  );
};


/**
 * Validate a hex string
 *
 * @method messageDataValidator
 *
 * @param {any} data The messageData to check
 *
 * @return {boolean} It only returns true if the data is a valid format,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const messageDataValidator = (data: any): boolean => {
  const { message: messageMessages } = messages;
  const validationSequence = [
    {
      /*
      * It should be a hex string or UInt8Array
      */
      expression: (typeof data === 'string' && hexSequenceValidator(data)) ||
        data.constructor === Uint8Array,
      message: `${messageMessages.notString}: ${objectToErrorString(data) ||
        UNDEFINED}`,
    },
  ];
  return validatorGenerator(
    validationSequence,
    `${messageMessages.genericError}: ${data || UNDEFINED}`,
  );
};
