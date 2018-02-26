/* @flow */

import { Wallet } from 'ethers';

export const create = () => Wallet.createRandom();

const softwareWallet = {
  create,
};

export default softwareWallet;
