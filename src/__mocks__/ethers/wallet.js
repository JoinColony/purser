const Wallet = jest.fn().mockImplementation((privatekey, provider) => {
  if (privatekey === '0x0') {
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

const ethersWallet = {
  Wallet,
};

export default ethersWallet;

export { Wallet };
