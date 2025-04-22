
# Zenclaim CLI Tool
A command line tools for claiming existing zen on Horizen 2.0. There are multiple tools includedin in one package.

It may be used on the command line or as a node module.

## Installation

Install the package    

```
npm install zenclaim-cli
```    
In the zenclaim-cli folder    
```
npm install
```

## Usage

### seedtool
Derive ZEN addresses and keys from a 12 or 24 word seed phrase


Example Usage:

As a CLI:
```
npx zenclaim-seedtool --mnemonicPhrase="your seed phrase here" --numAddresses=10 --network="testnet"
```


As a Module:
```
import { deriveAddresses } from 'seedtool';

const options = {
  mnemonicPhrase: "your 12 or 24 seed phrase here",
  mnemonicPassword: "",
  numAddresses: 10,
  derivationPath: "m/44'/121'/0'/0/",
  derivationAddressIndexOffset: 0,
  network: "testnet",
  stringify: true,
  verbose: true,
};

deriveAddresses(options).then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});

```

Arguments/Options:    
Only the mnemonicPhrase is required. Defaults are for ZEN mainnet. 
```
  --mnemonicPhrase="" (${'mandatory'.magenta} 12 or 24 words. 13th or 25th treated as password, if present)
  --mnemonicPassword="" (optional, default "", seed password)
  --numAddresses=int (optional, default 5)
  --derivationPath="" (optional, default "m/44'/121'/0'/0/")
  --derivationAddressIndexOffset=int (optional, default 0, offset of last integer in derivation path)
  --network="mainnet||testnet" (optional, default "mainnet")
  --stringify (optional default array, array as JSON.stringify() output)
  --help  display this help
  --verbose display additional values to help debug
  ${'Short forms of arguments'.cyan} 
  -ph="" -pw="" -na="" -dp="" -do="" -nt="" -s -h -v
`;
```
Notes: help is only available in the CLI.    

The short form of the options is also supported. Example
```
const options = {
ph: "your seed phrase here",
pw: "",
na: 10,
dp: "m/44'/121'/0'/0/",
do: 0,
nt: "testnet"
s: true 
v: true
}
``` 

### verifymessage    
Verify a given message and signature    

As a CLI:    
```
npx zenclaim-verifymessage --message="test message" --zenAddress="ztTmj8oJzBo2s8fcewUA3GexNUeWA24Qe8T" --signature="signature_here"
```
As a Module:    
```
import { verifyMessage } from './verifymessage.js';

const message = "test message";
const zenAddress = "ztTmj8oJzBo2s8fcewUA3GexNUeWA24Qe8T";
const signature = "signature_here";

const result = verifyMessage(message, zenAddress, signature);
if (result?.error) {
  console.error(result.error);
} else {
  console.log(result);
}
```


### signtool   
Sign a message with a private key. 

As a CLI    
```
npx zenclaim-signtool --privKey="your_private_key_here" --message="ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70" --network="testnet"
```

As a Module:    
```
import { signMessage } from './signtool.js';

const privKey = "your_private_key_here";
const message = "ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70";
const compressed = true;
const network = 1; // 1 for testnet, 0 for mainnet
const verbose = true;

const result = signMessage(message, privKey, compressed, network, verbose);
if (result.error) {
  console.error(result.error);
} else {
  console.log(result);
}
````
