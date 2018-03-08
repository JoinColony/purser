export const Wallet = jest.fn().mockImplementation((privatekey, provider) => {
  if (privatekey === '0x0' || privatekey === '') {
    throw new Error();
  }
  /*
   * A little trick to simulate an error during wallet creation
   */
  if (provider && provider.error) {
    throw new Error();
  }
  return this;
});

Wallet.createRandom = jest.fn(() => ({}));

Wallet.prototype.encrypt = jest.fn(
  password =>
    new Promise((resolve, reject) => {
      if (password) {
        return resolve(`{}`);
      }
      return reject();
    }),
);

export const HDNode = {
  fromMnemonic: jest.fn(mnemonic => ({
    derivePath: jest.fn(() => {
      if (mnemonic === 'romeo delta india golf') {
        return { privateKey: '0x1' };
      }
      return { privateKey: '0x0' };
    }),
  })),
  isValidMnemonic: jest.fn(mnemonic => {
    if (mnemonic === 'romeo delta india golf') {
      return true;
    }
    return false;
  }),
};

const ethersWallet = {
  Wallet,
  HDNode,
};

export default ethersWallet;
