/* @flow */

import U2fTransport from '@ledgerhq/hw-transport-u2f';
import LedgerHwAppETH from '@ledgerhq/hw-app-eth';
import EthereumTx from 'ethereumjs-tx';

import {
  multipleOfTwoHexValueNormalizer,
  addressNormalizer,
  hexSequenceNormalizer,
} from '../core/normalizers';
import { warning, objectToErrorString } from '../core/utils';
import { transactionObjectValidator } from '../core/helpers';
import { HEX_HASH_TYPE } from '../core/defaults';

import { staticMethods as messages } from './messages';

import type { TransactionObjectType } from '../core/flowtypes';

/**
 * Sign a transaction object and return the serialized signature (as a hex string)
 *
 * @TODO Add unit tests
 *
 * @method signTransaction
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
 * @return {Promise<string>} the hex signature string
 */
export const signTransaction = async (
  transactionObject: TransactionObjectType,
) => {
  const transport = await U2fTransport.create();
  const ethAppConnection = new LedgerHwAppETH(transport);
  const {
    derivationPath,
    gasPrice,
    gasLimit,
    chainId,
    nonce,
    to,
    value,
    inputData,
  } = transactionObjectValidator(transactionObject);
  try {
    /*
     * Ledger needs the unsigned "raw" transaction hex, which it will sign and
     * return the (R) and (S) signature components alog with the reco(V)ery param.
     *
     *
     * See fundamentals of Elliptic Curve Digital Signature Algorithm (ECDSA) to
     * get an general idea of where the three components come from:
     * https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
     *
     * Also, see EIP-155 for the 27 and 28 magic numbers expected in the recovery
     * parameter:
     * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
     *
     * Now, trezor will give you the recovery paramenter already encoded, but if you
     * want to derive the magic numbers again:
     */
    const unsignedTransaction = await new EthereumTx({
      /*
       * We could really do with some BN.js flow types declarations :(
       */
      /* $FlowFixMe */
      gas_price: multipleOfTwoHexValueNormalizer(gasPrice.toString(16)),
      /* $FlowFixMe */
      gas_limit: multipleOfTwoHexValueNormalizer(gasLimit.toString(16)),
      chain_id: chainId,
      /*
       * Nonces needs to be sent in as a hex string, and to be padded as a multiple of two.
       * Eg: '3' to be '03', `12c` to be `012c`
       */
      /* $FlowFixMe */
      nonce: multipleOfTwoHexValueNormalizer(nonce.toString(16)),
      /*
       * Trezor service requires the prefix from the address to be stripped
       */
      to: addressNormalizer(to),
      /* $FlowFixMe */
      value: multipleOfTwoHexValueNormalizer(value.toString(16)),
      /*
       * Trezor service requires the prefix from the input data to be stripped
       */
      data: hexSequenceNormalizer(inputData),
    });
    /*
     * Sign the transaction object via your Ledger Wallet
     *
     * We also warn the user here, since the device will need confirmation, but only in dev mode.
     */
    warning(messages.userSignInteractionWarning);
    const {
      r: rSignatureComponent,
      s: sSignatureComponent,
      v: recoveryParameter,
    } = await ethAppConnection.signTransaction(
      derivationPath,
      unsignedTransaction.serialize().toString(HEX_HASH_TYPE),
    );
    /*
     * Get the transaction object from the R, S, V signature components
     *
     * Sadly Flow doesn't have the correct types for node's Buffer Object
     */
    const unserializedSignedTransaction = await new EthereumTx({
      r: Buffer.from(rSignatureComponent, HEX_HASH_TYPE),
      s: Buffer.from(sSignatureComponent, HEX_HASH_TYPE),
      v: Buffer.from(
        /* $FlowFixMe */
        multipleOfTwoHexValueNormalizer(
          /*
           * Ledger needs the current chain Id (as a hex string) added to the
           * current recovery param, that's coming from the signed transaction.
           */
          /* $FlowFixMe */
          recoveryParameter + chainId.toString(16),
        ),
        HEX_HASH_TYPE,
      ),
    });
    /*
     * Serialize the signed transaction object
     */
    const serializedSignedTransaction = unserializedSignedTransaction
      .serialize()
      .toString(HEX_HASH_TYPE);
    /*
     * Add the hex prefix
     */
    return hexSequenceNormalizer(serializedSignedTransaction);
  } catch (caughtError) {
    throw new Error(
      `${messages.userSignTxGenericError}: ${objectToErrorString(
        transactionObject,
      )} ${caughtError.message}`,
    );
  }
};

export default signTransaction;
