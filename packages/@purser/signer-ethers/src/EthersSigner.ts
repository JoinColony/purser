import { Signer } from 'ethers';
import { BigNumber, BigNumberish, bigNumberify, poll } from 'ethers/utils';
import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from 'ethers/providers';

import {
  bigNumber,
  userInputValidator,
  PurserWallet,
  WalletSubType,
} from '@purser/core';

interface PurserSignerConstructorArguments {
  purserWallet: PurserWallet;
  provider: Provider;
}

const transformData = (data: BigNumberish): string => {
  if (typeof data == 'string') {
    return data;
  }
  if (typeof data == 'number') {
    return data.toString(16);
  }
  if (data instanceof BigNumber) {
    return data.toHexString();
  }
  return Buffer.from(data).toString('hex');
};

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
  private purserWallet: PurserWallet;

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

  private async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  private async getGasPrice(): Promise<BigNumber> {
    return this.provider.getGasPrice();
  }

  private async getGasLimit(tx: TransactionRequest): Promise<BigNumber> {
    const providerGasLimit = await this.provider.estimateGas({
      // We need to properly send `from`, so that `msg.sender` will have the correct value when estimating
      ...tx,
      from: this.purserWallet.address,
    });
    // If no gas limit is provided, we need to get the estimate and multiply it by 1.2 (an amount that will prevent the transaction from failing)
    return providerGasLimit.mul(bigNumberify(12)).div(bigNumberify(10));
  }

  private async getNonce(): Promise<number> {
    // MetaMask logs a warning if the nonce is already set, so only set the
    // nonce for other wallet types.
    if (this.purserWallet.subtype === WalletSubType.MetaMask) return undefined;
    return this.provider.getTransactionCount(this.purserWallet.address);
  }

  async getAddress(): Promise<string> {
    return this.purserWallet.address;
  }

  async signMessage(message: string): Promise<string> {
    return this.purserWallet.signMessage({ message });
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const { chainId, data, gasPrice, gasLimit, nonce, to, value } = tx;

    // All of these could be promises, so we await them.
    const ethersChainId = await chainId;
    const ethersData = await data;
    const ethersGasPrice = await gasPrice;
    const ethersGasLimit = await gasLimit;
    const ethersNonce = await nonce;
    const ethersTo = await to;
    const ethersValue = await value;

    const purserChainId = ethersChainId || (await this.getChainId());
    const purserGasPrice = ethersGasPrice || (await this.getGasPrice());
    const purserGasLimit = ethersGasLimit || (await this.getGasLimit(tx));
    const purserNonce = ethersNonce
      ? bigNumberify(ethersNonce).toNumber()
      : await this.getNonce();
    const purserData = transformData(ethersData);

    const purserTxRequest = {
      chainId: purserChainId,
      // We convert these values to purser BNs (yeah we should really standardize)
      gasPrice: bigNumber(purserGasPrice.toString()),
      gasLimit: bigNumber(purserGasLimit.toString()),
      nonce: purserNonce,
      value: ethersValue ? bigNumber(ethersValue.toString()) : undefined,
      inputData: purserData,
      to: ethersTo,
    };

    const signedTransaction = await this.purserWallet.sign(purserTxRequest);

    let txHash: string;
    if (this.purserWallet.subtype === WalletSubType.MetaMask) {
      // if metamask, tx has already been sent and the signedTransaction _IS_ the hash
      txHash = signedTransaction;
    } else {
      // otherwise we still need to send it
      const sentTx = await this.provider.sendTransaction(signedTransaction);
      txHash = sentTx.hash;
    }

    // We need to wait for transaction to be mined but ganache will mine the
    // transaction too quickly causing us to wait indefinitely, therefore, we
    // need to try getting the transaction and then, if that fails, we need to
    // try getting the transaction using `waitForTransaction`.
    const transaction = await this.provider.getTransaction(txHash);
    if (!transaction) {
      await this.provider.waitForTransaction(txHash);
    }

    return poll(
      async () => {
        const response = await this.provider.getTransaction(txHash);
        // If this request goes wrong, it returns null. But poll specifically
        // retries on undefined...
        if (response == null) {
          return undefined;
        }
        return response;
      },
      {
        timeout: 60000, // One minute
      },
    );
  }
}
