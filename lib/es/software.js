import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _typeof from 'babel-runtime/helpers/typeof';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import { Wallet as EtherWallet, HDNode } from 'ethers/wallet';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';

import { autoselect } from './providers';
import { getRandomValues, warning } from './utils';
import { softwareWallet as messages } from './messages';
import { ENV, GETTER_PROP_DESCRIPTORS, QR_CODE_OPTS, BLOCKIE_OPTS, WALLET_PROP_DESCRIPTORS, MNEMONIC_PATH } from './defaults';

/*
 * "Private" variable(s)
 */
var encryptionPassword = void 0;
var keystoreJson = void 0;
/**
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @TODO Expose (enumerate) prototype methods (getTransactionCount, getBalance, ...)
 * @TODO Add Wallet Object documentation for the newly exposed methods
 * @TODO Add Wallet Object documentation for the `sign()` wallet method
 *
 * @extends EtherWallet
 */

var SoftwareWallet = function (_EtherWallet) {
  _inherits(SoftwareWallet, _EtherWallet);

  function SoftwareWallet(privateKey, provider, password, mnemonic) {
    var path = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : MNEMONIC_PATH;
    var keystore = arguments[5];

    _classCallCheck(this, SoftwareWallet);

    var providerMode = typeof provider === 'function' ? provider() : provider;
    encryptionPassword = password;
    keystoreJson = keystore;
    /*
     * @TODO Check for similar prop names
     *
     * Eg: paSword vs. paSSword vs. passWRD, maybe find a fuzzy search lib
     * Alternatively take a look at React's code base and see how they've
     * implemented this.
     */
    if ((typeof provider === 'undefined' ? 'undefined' : _typeof(provider)) !== 'object' && typeof provider !== 'function') {
      warning(messages.noProvider);
      providerMode = undefined;
    }

    /*
     * We're using `defineProperties` instead of strait up assignment, so that
     * we can customize the prop's descriptors
     */
    var _this = _possibleConstructorReturn(this, (SoftwareWallet.__proto__ || Object.getPrototypeOf(SoftwareWallet)).call(this, privateKey, providerMode));

    Object.defineProperties(_this, {
      mnemonic: Object.assign({}, { value: mnemonic }, WALLET_PROP_DESCRIPTORS),
      path: Object.assign({}, { value: path }, WALLET_PROP_DESCRIPTORS)
    });
    return _this;
  }
  /*
   * Encrypted JSON Keystore
   */


  _createClass(SoftwareWallet, [{
    key: 'keystore',
    get: function get() {
      if (encryptionPassword) {
        /*
         * Memoizing the getter
         *
         * This is quite an expensive operation, so we're memoizing it that
         * on the next call (an the others after that) it won't re-calculate
         * the value again.
         */
        Object.defineProperty(this, 'keystore', Object.assign({}, GETTER_PROP_DESCRIPTORS, {
          value: keystoreJson && Promise.resolve(keystoreJson) || this.encrypt(encryptionPassword)
        }));
        return keystoreJson && Promise.resolve(keystoreJson) || this.encrypt(encryptionPassword);
      }
      warning(messages.noPassword);
      return Promise.reject();
    }
    /*
     * Just set the encryption password, we don't return anything from here,
     * hence we don't have a need for `this`.
     *
     * This is just an convenince to allow us to set the encryption password
     * after the wallet has be created / instantiated.
     */
    /* eslint-disable-next-line class-methods-use-this */
    ,
    set: function set(newEncryptionPassword) {
      encryptionPassword = newEncryptionPassword;
    }
    /*
     * Address QR Code
     */

  }, {
    key: 'addressQR',
    get: function get() {
      if (this.address) {
        /*
         * While this is not a particularly expensive operation (it is, but it's
         * small potatoes compared to the others), it's still a good approach
         * to memoize the getter, so we're doing that here as well.
         */
        Object.defineProperty(this, 'addressQR', Object.assign({}, GETTER_PROP_DESCRIPTORS, {
          value: qrcode.toDataURL(this.address, QR_CODE_OPTS)
        }));
        return qrcode.toDataURL(this.address, QR_CODE_OPTS);
      }
      warning(messages.noAddress, this.address, { level: 'high' });
      return Promise.reject();
    }
    /*
     * Address Identicon (Blockie)
     */

  }, {
    key: 'blockie',
    get: function get() {
      if (this.address) {
        var blockiePromise = Promise.resolve(blockies.create(Object.assign({}, BLOCKIE_OPTS, { seed: this.address })).toDataURL());
        /*
         * While this is not a particularly expensive operation (it is, but it's
         * small potatoes compared to the others), it's still a good approach
         * to memoize the getter, so we're doing that here as well.
         */
        Object.defineProperty(this, 'blockie', Object.assign({}, GETTER_PROP_DESCRIPTORS, { value: blockiePromise }));
        return blockiePromise;
      }
      warning(messages.noAddress, this.address, { level: 'high' });
      return Promise.reject();
    }
    /*
     * Private Key QR Code
     */

  }, {
    key: 'privateKeyQR',
    get: function get() {
      if (this.privateKey) {
        /*
         * While this is not a particularly expensive operation (it is, but it's
         * small potatoes compared to the others), it's still a good approach
         * to memoize the getter, so we're doing that here as well.
         */
        Object.defineProperty(this, 'privateKeyQR', Object.assign({}, GETTER_PROP_DESCRIPTORS, {
          value: qrcode.toDataURL(this.privateKey, QR_CODE_OPTS)
        }));
        return qrcode.toDataURL(this.privateKey, QR_CODE_OPTS);
      }
      warning(messages.noPrivateKey, this.privateKey, { level: 'high' });
      return Promise.reject();
    }
    /**
     * Create a new wallet.
     *
     * This will use EtherWallet's `createRandom()` (with defaults and entropy)
     * and use the resulting private key to instantiate a new SoftwareWallet.
     *
     * @method create
     *
     * @param {ProviderType} provider An available provider to add to the wallet
     * @param {Uint8Array} entropy An unsigned 8bit integer Array to provide extra randomness
     * @param {string} password Optional password used to generate an encrypted keystore
     *
     * All the above params are sent in as props of an {WalletArgumentsType} object.
     *
     * @return {WalletType} A new wallet object
     */

  }], [{
    key: 'create',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref) {
        var _ref$provider = _ref.provider,
            provider = _ref$provider === undefined ? autoselect() : _ref$provider,
            password = _ref.password,
            _ref$entropy = _ref.entropy,
            entropy = _ref$entropy === undefined ? new Uint8Array(65536) : _ref$entropy;
        var basicWallet;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                basicWallet = void 0;
                _context.prev = 1;

                if (!entropy || entropy && !(entropy instanceof Uint8Array)) {
                  warning(messages.noentropy);
                  basicWallet = this.createRandom();
                } else {
                  basicWallet = this.createRandom({
                    extraEntropy: getRandomValues(entropy)
                  });
                }
                return _context.abrupt('return', new this(basicWallet.privateKey, provider, password, basicWallet.mnemonic, basicWallet.path));

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](1);

                warning(messages.create, provider, entropy, _context.t0, { level: 'high' });
                return _context.abrupt('return', this.createRandom());

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 6]]);
      }));

      function create(_x2) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()
    /**
     * Open an existing wallet
     * Using either `mnemonic`, `private key` or `encrypted keystore`
     *
     * This will try to extract the private key from a mnemonic (if available),
     * and create a new SoftwareWallet instance using whichever key is available.
     * (the on passed in or the one extracted from the mnemonic).
     *
     * @method open
     *
     * @param {ProviderType} provider An available provider to add to the wallet
     * @param {string} password Optional password used to generate an encrypted keystore
     * @param {string} privateKey Optional (in case you pass another type)
     * @param {string} mnemonic Optional (in case you pass another type)
     * @param {string} path Optional path for the mnemonic (set by default)
     *
     * All the above params are sent in as props of an {WalletArgumentsType} object.
     *
     * @return {WalletType} A new wallet object (or undefined) if somehwere along
     * the line an error is thrown.
     */

  }, {
    key: 'open',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(walletArguments) {
        var _walletArguments$prov, provider, password, privateKey, mnemonic, keystore, _walletArguments$path, path, extractedPrivateKey, extractedMnemonic, extractedPath, keystoreWallet, mnemonicWallet;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                /*
                 * We can't destructure the arguments in the function signature, since we
                 * need to iterate through them in case of an error.
                 */
                _walletArguments$prov = walletArguments.provider, provider = _walletArguments$prov === undefined ? autoselect() : _walletArguments$prov, password = walletArguments.password, privateKey = walletArguments.privateKey, mnemonic = walletArguments.mnemonic, keystore = walletArguments.keystore, _walletArguments$path = walletArguments.path, path = _walletArguments$path === undefined ? MNEMONIC_PATH : _walletArguments$path;
                extractedPrivateKey = void 0;
                extractedMnemonic = void 0;
                extractedPath = void 0;
                _context2.prev = 4;

                if (!(keystore && this.isEncryptedWallet(keystore) && password)) {
                  _context2.next = 12;
                  break;
                }

                _context2.next = 8;
                return this.fromEncryptedWallet(keystore, password);

              case 8:
                keystoreWallet = _context2.sent;

                extractedPrivateKey = keystoreWallet.privateKey;
                extractedMnemonic = keystoreWallet.mnemonic;
                extractedPath = keystoreWallet.path;

              case 12:
                /*
                 * @TODO Detect if existing but not valid mnemonic, and warn the user
                 */
                if (mnemonic && HDNode.isValidMnemonic(mnemonic)) {
                  mnemonicWallet = HDNode.fromMnemonic(mnemonic).derivePath(path);

                  extractedPrivateKey = mnemonicWallet.privateKey;
                }
                /*
                 * @TODO Detect if existing but not valid private key, and warn the user
                 */
                return _context2.abrupt('return', new this(privateKey || extractedPrivateKey, provider, password, mnemonic || extractedMnemonic, path || extractedPath, keystore));

              case 16:
                _context2.prev = 16;
                _context2.t0 = _context2['catch'](4);

                warning(messages.open, Object.keys(walletArguments).reduce(function (allArgs, key) {
                  return '' + allArgs + key + ' (' + String(walletArguments[key]) + '), ';
                }, ''), _context2.t0, { level: 'high' });
                throw new Error();

              case 20:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 16]]);
      }));

      function open(_x3) {
        return _ref3.apply(this, arguments);
      }

      return open;
    }()
  }]);

  return SoftwareWallet;
}(EtherWallet);

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */


Object.defineProperties(SoftwareWallet.prototype, {
  keystore: GETTER_PROP_DESCRIPTORS,
  addressQR: GETTER_PROP_DESCRIPTORS,
  blockie: GETTER_PROP_DESCRIPTORS,
  privateKeyQR: GETTER_PROP_DESCRIPTORS
});

/**
 * Create a new wallet.
 * This method is the one that's actually exposed outside the module.
 *
 * @method create
 *
 * @param {WalletArgumentsType} walletArguments The wallet arguments object
 * This way you can pass in arguments in any order you'd like.
 * Details about it's types can be found inside `flowtypes`
 *
 * @return {WalletType} A new wallet object
 */
export var create = function create() {
  var walletArguments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return SoftwareWallet.create(walletArguments);
};

/**
 * Open (instantiate) a wallet.
 * This method is the one that's actually exposed outside the module.
 *
 * @method open
 *
 * @param {WalletArgumentsType} walletArguments The wallet arguments object
 * This way you can pass in arguments in any order you'd like.
 * Details about it's types can be found inside `flowtypes`
 *
 * @return {WalletType} A new wallet object
 * Will return `undefined` if no suitable method for ooening it was found.
 */
export var open = function open() {
  var walletArguments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return SoftwareWallet.open(walletArguments);
};

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
var softwareWallet = Object.assign({}, {
  create: create,
  open: open
}, ENV === 'development' || ENV === 'test' ? { SoftwareWallet: SoftwareWallet } : {});

export default softwareWallet;