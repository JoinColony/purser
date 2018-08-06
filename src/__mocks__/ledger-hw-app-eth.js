export const LedgerEthApp = jest.fn().mockImplementation(() => ({
  getAddress: jest.fn(),
  signTransaction: jest.fn(),
  signPersonalMessage: jest.fn(),
}));

export default LedgerEthApp;
