/* @flow */

import {
  derivationPathValidator,
  safeIntegerValidator,
  bigNumberValidator,
  addressValidator,
  hexSequenceValidator,
} from './validators';
import { derivationPathNormalizer } from './normalizers';
import { bigNumber } from './utils';

import { PATH, TRANSACTION } from './defaults';

import type {
  DerivationPathObjectType,
  TransactionObjectType,
} from './flowtypes';

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
 * ethereum deviation path.
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
  return (
    `${PATH.HEADER_KEY}/${purpose}` +
    `${DELIMITER}${coinType}` +
    `${DELIMITER}${account}` +
    `${DELIMITER}` +
    /*
     * We're already checking if the change and address index has a value, so
     * we're not coercing `undefined`.
     *
     * Flow is overreacting again...
     */
    /* $FlowFixMe */
    `${hasChange ? `${change}` : ''}` +
    /* $FlowFixMe */
    `${hasChange && hasAddressIndex ? `/${addressIndex}` : ''}`
  );
};

/**
 * Validate an transaction object
 *
 * @TODO Add unit tests
 * This will most likely be moving the existing ones from the Trezor sign method here.
 * Also, this method will need to be manually mocked for others to test agains it.
 *
 * @NOTE We can only validate here, we can't also normalize (with the exception of the derivation path).
 * This is because different wallet types expect different value formats so we must normalize them
 * on a case by case basis.
 *
 * @method transactionObjectValidator
 *
 * @param {string} derivationPath the derivation path for the account with which to sign the transaction
 * @param {bigNumber} gasPrice gas price for the transaction in WEI (as an instance of bigNumber), defaults to 9000000000 (9 GWEI)
 * @param {bigNumber} gasLimit gas limit for the transaction (as an instance of bigNumber), defaults to 21000
 * @param {number} chainId the id of the chain for which this transaction is intended
 * @param {number} nonce the nonce to use for the transaction (as a number)
 * @param {string} to the address to which to the transaction is sent
 * @param {bigNumber} value the value of the transaction in WEI (as an instance of bigNumber), defaults to 1
 * @param {string} inputData data appended to the transaction (as a `hex` string)
 *
 * All the above params are sent in as props of an {TransactionObjectType} object.
 *
 * @return {Object} The serialized path
 */
export const transactionObjectValidator = ({
  /*
   * Path defaults to the "default" derivation path
   */
  derivationPath,
  gasPrice = bigNumber(TRANSACTION.GAS_PRICE),
  gasLimit = bigNumber(TRANSACTION.GAS_LIMIT),
  /*
   * Chain Id defaults to the one set on the provider but it can be overwritten
   */
  chainId,
  nonce = TRANSACTION.NONCE,
  to,
  value = bigNumber(TRANSACTION.VALUE),
  inputData = TRANSACTION.INPUT_DATA,
}: TransactionObjectType = {}): TransactionObjectType => {
  /*
   * Check if the derivation path is in the correct format
   */
  derivationPathValidator(derivationPath);
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
   * Check if the address (`to` prop) is in the correct format
   */
  addressValidator(to);
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
    derivationPath: derivationPathNormalizer(derivationPath),
    gasPrice,
    gasLimit,
    chainId,
    nonce,
    to,
    value,
    inputData,
  };
};
