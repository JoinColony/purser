/* eslint-disable @typescript-eslint/no-explicit-any */
interface TestGlobal extends NodeJS.Global {
  web3?: any;
  ethereum?: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const testGlobal: TestGlobal = global;
