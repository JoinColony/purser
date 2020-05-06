import { Wallet } from 'ethers';
import { encrypt } from 'ethers/utils/secret-storage';
import { privateToPublic } from 'ethereumjs-util';

import { PurserWallet } from '@purser/core';
import {
  derivationPathSerializer,
  userInputValidator,
} from '@purser/core/helpers';
import { hexSequenceNormalizer } from '@purser/core/normalizers';
import {
  addressValidator,
  hexSequenceValidator,
} from '@purser/core/validators';

import { PATH, HEX_HASH_TYPE, REQUIRED_PROPS } from '@purser/core/constants';

import {
  SignMessageData,
  TransactionObjectTypeWithAddresses,
  VerifyMessageData,
  WalletType,
  WalletSubType,
} from '@purser/core/types';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';
import { walletClass } from './messages';

interface WalletOptions {
  chainId: number;
}

export default class SoftwareWallet implements PurserWallet {
  private ethersInstance: Wallet;

  private keystore?: string;

  private readonly mnemonic?: string;

  private readonly privateKey: string;

  readonly address: string;

  readonly derivationPath: string;

  readonly type: WalletType;

  readonly subtype: WalletSubType;

  readonly chainId: number;

  constructor(ethersInstance: Wallet, { chainId }: WalletOptions) {
    const { address, privateKey, mnemonic } = ethersInstance;
    /*
     * Validate the private key and address that's coming in from ethers.
     */
    addressValidator(address);
    hexSequenceValidator(privateKey);

    this.ethersInstance = ethersInstance;
    /*
     * If we have a keystore JSON string and encryption password, set them
     * to the internal variables.
     */
    this.privateKey = privateKey;
    this.address = address;
    this.type = WalletType.Software;
    this.subtype = WalletSubType.Ethers;
    this.chainId = chainId;
    if (mnemonic) {
      this.mnemonic = mnemonic;
    }
    Object.defineProperties(this, {});
  }

  /*
   * @TODO Allow users control of the derivation path
   * When instantiating a new class instance. But this is only if the feature
   * turns out to be required.
   */
  // eslint-disable-next-line class-methods-use-this
  async getDerivationPath(): Promise<string> {
    return derivationPathSerializer({
      change: PATH.CHANGE,
      addressIndex: PATH.INDEX,
    });
  }

  async getKeystore(encryptionPassword: string): Promise<string> {
    if (!encryptionPassword) {
      throw new Error(walletClass.noPassword);
    }
    return encrypt(this.privateKey, encryptionPassword);
  }

  async getMnemonic(): Promise<string> {
    return this.mnemonic;
  }

  async getPublicKey(): Promise<string> {
    const privateKey: string = await this.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, HEX_HASH_TYPE);
    const publicKeyBuffer = privateToPublic(privateKeyBuffer);
    const reversedPublicKey: string = publicKeyBuffer.toString(HEX_HASH_TYPE);
    /*
     * Validate the reversed public key
     */
    hexSequenceValidator(reversedPublicKey);
    /*
     * Then normalize it to ensure it has the `0x` prefix
     */
    const normalizedPublicKey: string = hexSequenceNormalizer(
      reversedPublicKey,
    );
    return normalizedPublicKey;
  }

  async getPrivateKey(): Promise<string> {
    return this.privateKey;
  }

  async sign(
    transactionObject: TransactionObjectTypeWithAddresses,
  ): Promise<string> {
    /*
     * Validate the trasaction's object input
     */
    userInputValidator({
      firstArgument: transactionObject,
    });
    const { chainId: transactionChainId = this.chainId } =
      transactionObject || {};

    return signTransaction({
      ...transactionObject,
      chainId: transactionChainId,
      callback: this.ethersInstance.sign.bind(this.ethersInstance),
    });
  }

  async signMessage(messageObject: SignMessageData): Promise<string> {
    /*
     * Validate the trasaction's object input
     */
    userInputValidator({
      firstArgument: messageObject,
      requiredOr: REQUIRED_PROPS.SIGN_MESSAGE,
    });
    return signMessage({
      message: messageObject.message,
      messageData: messageObject.messageData,
      callback: this.ethersInstance.signMessage.bind(this.ethersInstance),
    });
  }

  async verifyMessage(
    signatureVerificationObject: VerifyMessageData,
  ): Promise<boolean> {
    /*
     * Validate the trasaction's object input
     */
    userInputValidator({
      firstArgument: signatureVerificationObject,
      requiredAll: REQUIRED_PROPS.VERIFY_MESSAGE,
    });
    const { message, signature } = signatureVerificationObject;
    return verifyMessage({
      address: this.address,
      message,
      signature,
    });
  }
}
