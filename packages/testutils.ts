/* eslint-disable @typescript-eslint/no-explicit-any */
type JestMock<F extends (...args: any) => any> = jest.Mock<ReturnType<F>>;

export const jestMocked = (fn: (...args: any[]) => any): any =>
  fn as JestMock<typeof fn>;
/* eslint-enable @typescript-eslint/no-explicit-any */
