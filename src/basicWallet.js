/* @flow */

import { Wallet } from 'ethers';

const basicWallet = {
  new: (): void => Wallet.createRandom(),
};

export default basicWallet;
