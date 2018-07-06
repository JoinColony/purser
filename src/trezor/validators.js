/* @flow */

import { assertTruth } from '../utils';
import { validators as messages } from './messages';
import { PATH, MATCH } from './defaults';

/*
 * @TODO Make validators core methods
 *
 * These validators will most likely be used across all wallet types, so it will
 * make sense that as some point they will become core validators.
 */

const UNDEFINED = 'undefined';

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
  const validationTests: Array<boolean> = [];
  let deSerializedDerivationPath: Array<string> = [];
  try {
    /*
     * Because assignments get bubbled to the top of the method, we need to wrap
     * this inside a try/catch block.
     *
     * Otherwise, this will fail before we have a change to assert it.
     */
    deSerializedDerivationPath = derivationPath.split(PATH.DELIMITER);
  } catch (error) {
    /*
     * It should be a string
     */
    validationTests.push(
      assertTruth({
        expression: typeof derivationPath === 'string',
        message: [
          `${derivationPathMessages.notString}:`,
          derivationPath || UNDEFINED,
        ],
      }),
    );
  }
  /*
   * It should be composed of (at least) four parts
   * (purpouse, coin, account, change + index)
   */
  validationTests.push(
    assertTruth({
      expression: deSerializedDerivationPath.length === 4,
      message: [
        `${derivationPathMessages.notValidParts}: [`,
        ...deSerializedDerivationPath,
        ']',
      ],
    }),
  );
  /*
   * It should have the Ethereum reserved Purpouse (44)
   */
  validationTests.push(
    assertTruth({
      expression:
        parseInt(deSerializedDerivationPath[0].slice(2), 10) === PATH.PURPOSE,
      message: [
        `${derivationPathMessages.notValidPurpouse}:`,
        deSerializedDerivationPath[0] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct Coin type
   */
  const coinType: number = parseInt(deSerializedDerivationPath[1], 10);
  const { COIN_MAINNET, COIN_TESTNET } = PATH;
  validationTests.push(
    assertTruth({
      expression: coinType === COIN_MAINNET || coinType === COIN_TESTNET,
      message: [
        `${derivationPathMessages.notValidCoin}:`,
        deSerializedDerivationPath[1] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct Account format (eg: a number)
   */
  validationTests.push(
    assertTruth({
      expression: !!deSerializedDerivationPath[2].match(MATCH.DIGITS),
      message: [
        `${derivationPathMessages.notValidAccount}:`,
        deSerializedDerivationPath[2] || UNDEFINED,
      ],
    }),
  );
  /*
   * It should have the correct Change and/or Account Index format (eg: a number)
   */
  validationTests.push(
    assertTruth({
      expression: deSerializedDerivationPath[3]
        .split('/')
        .map(value => !!value.match(MATCH.DIGITS))
        .every(truth => truth !== false),
      message: [
        `${derivationPathMessages.notValidChangeIndex}:`,
        deSerializedDerivationPath[3] || UNDEFINED,
      ],
    }),
  );
  /*
   * This is a fail-safe in case anything splis through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.some(test => test !== false)) {
    throw new Error(
      `${derivationPathMessages.genericError}: ${derivationPath || UNDEFINED}`,
    );
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};

const validators = {
  derivationPathValidator,
};

export default validators;
