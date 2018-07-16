export const promptGenerator = jest.fn({
  postMessage: jest.fn(),
  close: jest.fn(),
});

export const payloadListener = jest.fn(() =>
  Promise.resolve({
    sucess: true,
    publicKey: 'mocked-private-key',
    chainCode: 'mocked-chain-code',
  }),
);

export const derivationPathSerializer = jest.fn(() => 'mocked-derivation-path');
