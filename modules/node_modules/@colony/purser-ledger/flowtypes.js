/* @flow */

/*
 * See: http://ledgerhq.github.io/ledgerjs/docs/#ethgetaddress
 */
type GetAddressReturnType = {
  publicKey: string,
  chainCode: string,
  address: string,
};
/*
 * This is the same (in terms of types) for both a transaction signature and
 * a message signature.
 */
type SignatureReturnType = {
  r: string,
  s: string,
  v: number,
};
/*
 * But the transaction signature returns  the recovery param as a `String`.
 * See: http://ledgerhq.github.io/ledgerjs/docs/#ethsigntransaction
 */
type TransactionSignatureReturnType = {
  ...SignatureReturnType,
  v: string,
};
/*
 * Whereas the message signature returns  the recovery param as a `Number`.
 * See: http://ledgerhq.github.io/ledgerjs/docs/#ethsignpersonalmessage
 */
type MessageSignatureReturnType = {
  ...SignatureReturnType,
  v: number,
};

export type LedgerInstanceType = {
  getAddress: (
    /*
     * From this you derive each address's index
     */
    rootDerivationPath: string,
    /*
     * Do you want to notify the user that you're accessing the account?
     */
    deviceDisplay: boolean,
    /*
     * Do you want the method to also return the chain code?
     */
    returnChainCode: boolean,
  ) => Promise<GetAddressReturnType>,
  signTransaction: (
    /*
     * The individual address's derivation path (after it was derived with the address index)
     */
    derivationPath: string,
    /*
     * The `hex` hash of the transaction before being signed (eg: unsigned transaction)
     */
    unsignedTransactionHash: string,
  ) => Promise<TransactionSignatureReturnType>,
  signPersonalMessage: (
    /*
     * The individual address's derivation path (after it was derived with the address index)
     */
    derivationPath: string,
    /*
     * The `hex` hash of the massage that's going to be singed
     */
    messageHash: string,
  ) => Promise<MessageSignatureReturnType>,
};

/*
 * The Error thrown by the U2F transport is not a standard Error instance
 */
export type U2FTransportError = {
  ...Error,
  id: string,
  originalError: Object,
};
