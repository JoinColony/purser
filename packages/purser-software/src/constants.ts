/*
 * Prop names used to validate user input against
 */
export const REQUIRED_PROPS = {
  OPEN_WALLET: ['privateKey', 'mnemonic', 'keystore'],
};

const softwareWalletDefaults = {
  REQUIRED_PROPS,
};

export default softwareWalletDefaults;
