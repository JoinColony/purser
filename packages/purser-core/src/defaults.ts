

import { DerivationPathDefaultType } from './types';

/*
 * Build environment
 */
export const ENV: string = (process && process.env.NODE_ENV) || 'development';

export const PATH: DerivationPathDefaultType = {
  /*
   * Ethereum HD Wallet Bip32 Derivation path
   *
   * See the ongoing standardization discussions:
   * https://github.com/ethereum/EIPs/issues/84
   */
  /*
   * The default (and only one that is correct, as far as I know of) header key
   */
  HEADER_KEY: 'm',
  /*
   * Ethereum reserved purpouse
   */
  PURPOSE: 44,
  /*
   * ETH coin type is 60 for main net, and 1 for test nets
   */
  COIN_MAINNET: 60,
  COIN_TESTNET: 1,
  ACCOUNT: 0,
  CHANGE: 0,
  /*
   * First address index
   */
  INDEX: 0,
  /*
   * Characters seqeunce used as a deviation path delimiter
   */
  DELIMITER: "'/",
};

/*
 * Regex to use when validating strings
 */
export const MATCH = {
  DIGITS: /^\d+$/,
  ADDRESS: /^(0x)?([0-9a-fA-F]{40})$/,
  /*
   * Just like the address above, but without the character number limit
   */
  HEX_STRING: /^(0x)?([0-9a-fA-F]*)$/,
  URL: /^.+:\/\/[^‌​/]+/,
};

/*
 * Used to separate misc. derivation paths or urls
 */
export const SPLITTER: string = '/';

/*
 * Used to better inform the user when a variable doesn't have a value
 * (Used in Error messsages)
 */
export const UNDEFINED: string = 'undefined';

/*
 * Hash types
 */
export const HEX_HASH_TYPE: BufferEncoding = 'hex';

export const WEI_MINIFICATION: number = 1e18;
export const GWEI_MINIFICATION: number = 1e9;

/*
 * Default class descriptors.
 * Most likely to be used with `Object.defineProperty()`
 */
export const DESCRIPTORS = {
  GETTERS: {
    enumerable: true,
    configurable: true,
  },
  SETTERS: {
    enumerable: true,
    writable: true,
  },
  WALLET_PROPS: {
    enumerable: true,
    writable: false,
  },
  GENERIC_PROPS: {
    enumerable: true,
    writable: true,
    configurable: true,
  },
};

/*
 * Defaults for the transaction object
 */
export const TRANSACTION  = {
  CHAIN_ID: 1,
  GAS_PRICE: '9000000000', // 9 Gwei
  GAS_LIMIT: '21000',
  NONCE: 0,
  VALUE: '0',
  INPUT_DATA: '',
};

/*
 * Values used to seed the initial signature object
 */
export const SIGNATURE = {
  R: 0,
  S: 0,
  RECOVERY_ODD: 27,
  RECOVERY_EVEN: 28,
};

export const HTTPS_PROTOCOL: string = 'https:';

/*
 * Chain IDs
 */
export const CHAIN_IDS = {
  HOMESTEAD: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GOERLI: 5,
  KOVAN: 42,
  LOCAL: 1337,
};

/*
 * Network names
 */
export const NETWORK_NAMES = {
  MAINNET: 'mainnet',
  ROPSTEN: 'ropsten',
  RINKEBY: 'rinkeby',
  KOVAN: 'kovan',
  GOERLI: 'goerli',
};

/*
 * Hardforks
 */
export const HARDFORKS = {
  BYZANTIUM: 'byzantium',
  CHAINSTART: 'chainstart',
  CONSTANTINOPLE: 'constantinople',
  DAO: 'dao',
  HOMESTEAD: 'homestead',
  ISTANBUL: 'istanbul',
  PETERSBURG: 'petersburg',
  SPURIOUS_DRAGON: 'spuriousDragon',
  TANGERINE_WHISTLE: 'tangerineWhistle',
};

/*
 * Prop names used to validate user input against
 */
export const REQUIRED_PROPS = {
  /*
   * Exactly one of these
   */
  SIGN_MESSAGE: ['message', 'messageData'],
  VERIFY_MESSAGE: ['message', 'signature'],
};
