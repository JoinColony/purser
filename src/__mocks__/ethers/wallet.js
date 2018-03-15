export const Wallet = jest.fn().mockImplementation((privatekey, provider) => {
  if (privatekey === '0x0' || !privatekey) {
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

Wallet.prototype.encrypt = jest.fn(
  password =>
    new Promise((resolve, reject) => {
      if (password) {
        return resolve(`{}`);
      }
      return reject();
    }),
);

Wallet.createRandom = jest.fn(() => ({ privateKey: '0x1' }));

Wallet.isEncryptedWallet = jest.fn(jsonString => {
  const keystoreObject = JSON.parse(jsonString);
  if (Object.prototype.hasOwnProperty.call(keystoreObject, 'address')) {
    return true;
  }
  return false;
});

Wallet.fromEncryptedWallet = jest.fn(keystore => ({
  privateKey: '0x1',
  address: JSON.parse(keystore).address,
  mnemonic: 'romeo delta india golf',
}));

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
