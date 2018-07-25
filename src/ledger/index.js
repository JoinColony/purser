/* @flow */

import U2fTransport from '@ledgerhq/hw-transport-u2f';
import LedgerHwAppETH from '@ledgerhq/hw-app-eth';
import HDKey from 'hdkey';
import { SigningKey } from 'ethers/wallet';

import { derivationPathSerializer } from '../core/helpers';

import { HEX_HASH_TYPE } from '../trezor/defaults';

import type { WalletObjectType, WalletExportType } from '../flowtypes';

const ledgerWallet: WalletExportType = Object.assign(
  {},
  {
    open: async (): Promise<WalletObjectType | void> => {
      const transport = await U2fTransport.create();
      const ethAppConnection = new LedgerHwAppETH(transport);
      const { publicKey, chainCode } = await ethAppConnection.getAddress(
        /*
         * @NOTE Ledger requires a derivation path containing only the account value
         * No change and index
         */
        derivationPathSerializer(),
        false,
        true,
      );
      /*
       * Derive the public key with the address index, so we can get the address
       */
      const hdKey = new HDKey();
      /*
       * Sadly Flow doesn't have the correct types for node's Buffer Object
       */
      /* $FlowFixMe */
      hdKey.publicKey = Buffer.from(publicKey, HEX_HASH_TYPE);
      /*
       * Sadly Flow doesn't have the correct types for node's Buffer Object
       */
      /* $FlowFixMe */
      hdKey.chainCode = Buffer.from(chainCode, HEX_HASH_TYPE);
      const derivationKey = hdKey.deriveChild(0);
      const addressFromPublicKey = SigningKey.publicKeyToAddress(
        /*
         * Sadly Flow doesn't have the correct types for node's Buffer Object
         */
        /* $FlowFixMe */
        Buffer.from(derivationKey.publicKey, HEX_HASH_TYPE),
      );
      return addressFromPublicKey;
    },
  },
);

export default ledgerWallet;
