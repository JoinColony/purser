# API

This docs serve to outline the API format and methods provided by `colony-wallet`.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console. When building with `NODE_ENV=production` all output will be silenced.

## Contents

* [Providers](#Providers)
  * [`etherscan()`](#etherscan)

## Providers

Create a connection to an Ethereum blockchain. This is achieved differently by the various providers.

HTTP API endpoint for _etherscan_ and _infura_, injected into the webpage in the case of _metamask_, or local RPC connection in the case of _localhost_.

### `etherscan()`

#### `etherscan([network: string], [token: string])`

This provider method takes an optional `network` name as string _(defaults to 'homestead')_ and an optional, but very recommended `token` -- without it the connection will still work but will be very limited. A new token for the Etherscan API can be generated [here](https://etherscan.io/myapikey).

```js
import { etherscan } from 'colony-wallet/providers';

const provider = etherscan('homestead', '<your-token-key>'); // { chainId: '', ensAddress: '', ... }
```
