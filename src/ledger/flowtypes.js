/* @flow */

/*
 * See: http://ledgerhq.github.io/ledgerjs/docs/#ethgetaddress
 */
type GetAddressReturnType = {
  publicKey: string,
  chainCode: string,
  address: string,
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
};

/*
 * The Error thrown by the U2F transport is not a standard Error instance
 */
export type U2FTransportError = {
  ...Error,
  id: string,
  originalError: Object,
};
