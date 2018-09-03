/* @flow */

/*
 * Prop names used to validate user input against
 */
export const REQUIRED_PROPS: Object = {
  OPEN_WALLET: ['privateKey', 'mnemonic', 'keystore'],
};

const softwareWalletDefaults: Object = {
  REQUIRED_PROPS,
};

export default softwareWalletDefaults;
