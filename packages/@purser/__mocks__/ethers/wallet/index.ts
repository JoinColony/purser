export const Wallet: jest.Mock<any, any> & {
  createRandom?: jest.Mock<any, any>;
  fromEncryptedJson?: jest.Mock<any, any>;
} = jest.fn().mockImplementation(privateKey => {
  if (privateKey === '0x0' || !privateKey) {
    throw new Error();
  }
  return {
    address: '0xacab',
    mnemonic: 'all cows are beautiful',
    privateKey,
    sign: jest.fn(),
    signMessage: jest.fn(),
  };
});

Wallet.createRandom = jest.fn(() => ({ privateKey: 'mocked-private-key' }));

Wallet.fromEncryptedJson = jest.fn(() => ({
  privateKey: 'mocked-private-key',
  address: '0xacab',
  mnemonic: 'all cows are beautiful',
}));

export default Wallet;
