import BN from 'bn.js';

import { WEI_MINIFICATION, GWEI_MINIFICATION } from './constants';

const oneWei = new BN(WEI_MINIFICATION.toString());
const oneGwei = new BN(GWEI_MINIFICATION.toString());

export default class ExtendedBN extends BN {
  /*
   * Convert the number to WEI (multiply by 1 to the power of 18)
   */
  toWei(): BN {
    return this.imul(oneWei);
  }

  /*
   * Convert the number to WEI (divide by 1 to the power of 18)
   */
  fromWei(): BN {
    return this.div(oneWei);
  }

  /*
   * Convert the number to GWEI (multiply by 1 to the power of 9)
   */
  toGwei(): BN {
    return this.imul(oneGwei);
  }

  /*
   * Convert the number to GWEI (divide by 1 to the power of 9)
   */
  fromGwei(): BN {
    return this.div(oneGwei);
  }
}
