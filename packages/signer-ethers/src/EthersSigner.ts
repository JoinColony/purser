import { Signer } from 'ethers';
import { bigNumberify } from 'ethers/utils';
import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from 'ethers/providers';

import { userInputValidator } from '@purser/core/helpers';
import { WalletArgumentsType } from '@purser/core/types';

interface PurserSignerConstructorArguments {
  purserWallet: WalletArgumentsType;
  provider: Provider;
}

/**
 * Create a new instance of an Abstract Signer
 *
 * A signer is required by design to have the following props: `provider`,
 * `getAddress`, `signMessage` and `sendTransaction`
 *
 * See more: https://docs.ethers.io/ethers.js/html/api-wallet.html#signer-api
 *
 * @class EthersSigner
 *
 * @extends Signer
 *
 * @param {Object} purserWalletInstance A purser instantiated wallet
 * @param {Object} provider A provieder, most likely instantiated from Etherscan
 *
 * The above parameters are sent in as props of an object.
 *
 * @return {EthersSigner} A new instance of the class containing the expected props
 */
export default class EthersSigner extends Signer {
  private purserWallet: WalletArgumentsType;

  provider: Provider;

  constructor({ purserWallet, provider }: PurserSignerConstructorArguments) {
    super();
    userInputValidator({
      firstArgument: { purserWallet, provider },
      requiredAll: ['purserWallet', 'provider'],
    });
    this.purserWallet = purserWallet;
    this.provider = provider;
  }

  async getAddress(): Promise<string> {
    return this.purserWallet.address;
  }

  async signMessage(message: string): Promise<string> {
    return this.purserWallet.signMessage({ message });
  }

  async sendTransaction({
    chainId,
    gasPrice,
    gasLimit,
    nonce,
    value,
    data,
  }: TransactionRequest): Promise<TransactionResponse> {
    const resolvedChainId = await chainId;
    const resolvedGasPrice = await gasPrice;
    const resolvedGasLimit = await gasLimit;
    const resolvedNonce = await nonce;
    const resolvedValue = await value;
    const resolvedData = await data;

    if (
      !resolvedChainId ||
      !resolvedData ||
      !resolvedGasPrice ||
      !resolvedGasLimit ||
      !resolvedNonce ||
      !resolvedValue
    ) {
      throw new Error(
        // eslint-disable-next-line max-len
        'Transaction is missing one of these values: chainId, gasPrice, gasLimit, nonce, value, data',
      );
    }

    const purserTxRequest = {
      chainId: resolvedChainId,
      gasPrice: resolvedGasPrice.toString(),
      gasLimit: resolvedGasLimit.toString(),
      nonce: bigNumberify(resolvedNonce).toNumber(),
      value: resolvedValue.toString(),
      inputData:
        typeof resolvedData == 'string'
          ? resolvedData
          : Buffer.from(resolvedData).toString('hex'),
    };

    const signedTransaction = this.purserWallet.sign(purserTxRequest);
    return this.provider.sendTransaction(signedTransaction);
  }
}
