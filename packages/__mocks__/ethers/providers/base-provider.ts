export class BaseProvider {
  sendTransaction = jest.fn(() => '0xcabcab');

  getTransaction = jest.fn(() => ({ hash: '0xcabcab' }));
}
