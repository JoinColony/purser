/* @flow */

import type { WalletIndexExportType } from './flowtypes';

import software from './software';
import hardware from './hardware';

export { software };
export { hardware };

const wallet: WalletIndexExportType = {
  software,
  hardware,
};

export default wallet;
