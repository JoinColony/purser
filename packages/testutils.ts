/* eslint-disable @typescript-eslint/no-explicit-any */
type JestMock<F extends (...args: any) => any> = jest.Mock<ReturnType<F>>;

export const jestMocked = (fn: (...args: any[]) => any): any =>
  fn as JestMock<typeof fn>;

interface TestGlobal extends NodeJS.Global {
  web3?: any;
  ethereum?: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const testGlobal: TestGlobal = global;
