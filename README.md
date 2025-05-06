
# Zenclaim CLI Tool
A command line utility for claiming existing ZEN migrated to Base. There are multiple tools included that may be used on the command line or as a node module in other nodejs applications.    
## Overview
A snapshot of all ZEN account balances was taken at a certain point in time and added to a smart contract on Base. A claim process was created to allow ZEN holders to claim their new ZEN by creating and submitting a claim.  There is a website to make simple claims (see horizen.io website). For more complex or bulk claims and for claiming funds from multisig addresses this tool helps with all steps of the process.

The general claim process is to create and sign a message with the private key of the ZEN address that contains the ZEN.    
The message and a Base destination is then sent to a contract on the Base network after verifying the message and the balance.    
The contract sends the amount found in the snapshot to the destination address on Base.

## Tools included
Tools included allow you to:
   - recover ZEN addresses and private keys from a seed phrase
   - sign a message with a private key
   - verify a signed message
   - submit a claim for a standard transparent address
   - submit a claim for a multisig address
   - return the public key recovered from a signed message

## CAUTION
This tool requires seed phrases and private keys on both ZEN and Base networks for some of the tools. Steps should be taken to protect the secret values in all environments.


## Installation

Prerequisites: nodejs version 20 or higher.    

To install the package, clone the repository from github.

```
git clone https://github.com/HorizenOfficial/horizen-migration-cli.git
```    
In the horizen-migration-cli folder install the node modules
```
npm install
```

To test the installation, in the installation folder run
```
npx zenclaim-signtool --help
```


## Usage
For ease of use, references have been created that point to the individual main files. These files support running as both command line (bash) or importing as a module.  The mapping may be found in the package.json file.


### zenclaim-seedtool
Derive ZEN addresses and keys from a seed phrase.  Most seed phrases are 24 words. Some older wallets used 12 words.  Any number of words are supported by the tool.  Be sure to enter words separated by one space with no leading or trailing spaces. The words and their order must match the original exactly.  Check the addresses returned.

This returns a JSON object with multiple addresses and keys or an object with an error message.

Example Usage:

As a CLI:
```bash
npx zenclaim-seedtool --mnemonicPhrase="your seed phrase here" 
```


As a module:
```javascript
import { deriveAddresses } from 'zenclaim-seedtool';

const options = {
  mnemonicPhrase: "your usually 12 or 24 seed phrase here",
};

deriveAddresses(options).then(result => {
  if(result.error) return console.error(result.error);
  console.log(result);
}).catch(error => {
  console.error(error.message);
});

```

#### Arguments/Options:    
Only the mnemonicPhrase is required. Defaults are for ZEN mainnet and the default derivation path.   
Drop the dashes when creating an options object for module use.
```javascript
  --mnemonicPhrase="" (mandatory, usually 12 or 24 words)
  --mnemonicPassword="" (optional, default "", seed password)
  --numAddresses=int (optional, default 5)
  --derivationPath="" (optional, default "m/44'/121'/0'/0/")
  --derivationAddressIndexOffset=int (optional, default 0, offset of last integer in derivation path)
  --network="mainnet||testnet" (optional, default "mainnet")
  --stringify (optional default array, array as JSON.stringify() output)
  --help  display this help
  --verbose display additional values to help debug
 Short forms of arguments for the command line only
  -ph="" -pw="" -na= -dp="" -do="" -nt="" -s -h -v
```
Notes: help, stringify and short forms are only available in the CLI.    

### zenclaim-signtool   
Sign a special message with the private key of the ZEN source address. See instructions for building a message for a multisig address in multisig tool as it has a different format.

The format of the message to sign is the word "ZENCLAIM" plus the address (checksum format) of the account on Base to receive the funds. 
The private key is from the address containing the ZEN at the time of the snapshot.

Returns an object with an address and signature or an object with an error message. 

As a CLI    
```bash
npx zenclaim-signtool --privKey="your_zen_private_key_here" --message="your_message_here"
```

As a module:    
```javascript
import { signMessage } from 'zenclaim-signtool';

const options = { privKey:"your_private_key_here", message: "your_message_here" }

signMessage(options).then(result => {
  if (result.error) {
    console.error(result.error);
  } else {
  console.log(result);
  }
}).catch(error => {
  console.error(error.message);
});
```    
#### Arguments/Options:    
Only the message and private key are required. Defaults are for ZEN mainnet.   
Drop the dashes when creating the options object for module use.
```javascript
 --privKey="" (mandatory, WIF (Wallet Import Format) or raw format private key)
 --message="" (mandatory) 
 --compressed=true||false (optional, default true) 
 --network="mainnet||testnet" (optional, default mainnet)
 --stringify (optional JSON.stringify() output, default object {signature, address})
 --help  display this help
 --verbose  display additional values to help debug
Short forms of arguments for the command line only
  -pk="" -ms="" -cp= -nt="" -s -h -v
```
The message to sign should consist of the word ZENCLAIM and the destination address on Base
  Example "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC"
See the multisig claim tool for the message to sign for multisig addresses. That tool can generate the message to sign for you.


### zenclaim-verifymessage    
Verify a message when passed a message, ZEN address, and signature.    
Returns either true or false on success or an object with an error message.  

As a CLI:    
```bash
npx zenclaim-verifymessage --message="your_signed_message_here" --zenAddress="your_znaddress_here" --signature="signature_here"
```
As a Module:    
```javascript
import { verifyMessage } from 'zenclaim-verifymessage';

const optins = {message: "message_here", zenAddress = "zen_address_here", signature = "signature_here"};

verifyMessage(options).then(result => {
  if (result.error) {
    console.error(result.error);
  } else {
  console.log(result);
  }
}).catch(error => {
  console.error(error.message);
});
```
#### Arguments/Options:    
The message, zenAddress and signature are all required.    
Drop the dashes when creating an options object for module use.
```javascript
 --message="" (mandatory) 
 --zenAddress="" (mandatory)
 --signature="" (mandatory)
 --network="mainnet||testnet" (optional, default mainnet)
 --help  display this help
 --verbose  display arguments received
Short forms of arguments for command line 
  -ms="" -za="" -sg="" -h -v 
```


### zenclaim-claimzenaddress
Submit a claim for a standard ZEN transparent address.     
This validates the claim and sends a transaction to the smart contract on Base. The call requires access to the internet and uses the sender's private key.    

There are default providers in the mainconfig.js file that may be changed.    
The sender does not have to be the destinations address.  Be sure there are funds in the sender's address to cover gas fees. It will be checked prior to sending.   

The ZEN address source, destination address on Base, message signature, and sender's private key are all required.    

Returns the transcation hash on success or an object with an error message.


As a CLI:
```bash
npx zenclaim-claimzenaddress --zenAddres="source_address_here" --detinationAddress="base_address_here" --signature="from_signed_message" --senderAddressPrivKey="base_senders_private_key"
```

As a module:
```javascript
import { claimZenAddress } from 'zenclaim-claimzenaddress';

const options = { 
 zenAddress: "source_zen_address",
 destinationAddress: "base_destination_address",
 signature: "signature_from signed_message",
 senderAddressPrivKey: "base_senders_private_key"
};

claimZenAddress(options).then(result => {
  if (result.error) {
    console.error(result.error);
  } else {
    console.log(result);
  }
}).catch(error => {
  console.error(error.message);
});
```

#### Arguments/Options:  
The private key and Base destination address are required. Defaults are for ZEN mainnet.  
Drop the dashes when creating an options object for module use.
```javascript
 --zenAddress="" (mandatory, Horizen 1 Mainchain address) 
 --destinationAddress="0x.." (mandatory, claim destination Ethereum address on Base L2 starting with 0x) 
 --signature="" (mandatory signed message signature from zenAddress) 
 --senderAddressPrivKey="0x.." (mandatory, private key of Ethereum address sending the transaction and paying the fee)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
Short forms of arguments for command line 
  -za="" -da="" -sg="" -pk="" -gf= -pf= -nt="" -h -v
```
The message to sign should consist of the word ZENCLAIM and the destination address (starting with 0x) on Base and should be signed with the public key of the ZEN address of the funds.
  Example "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC"



### zenclaim-recoverpubkey
Recover the public key of a ZEN address from a signed message. This tool extracts the public key and determines the x and y coordinates required by the claim smart contract.

The claim smart contract requires the public key of the claimed address in a special format. This command extracts the public key of the zen address from the message and message signature and determines the x and y coordinates. It is unlikey it would be used unless you are building a custom script or app to submit claims. The claim tools already perform this acion.

Returns an object with the x and y coordinates or an object with an error message

As a CLI:
```bash
npx zenclaim-recoverpubkey --message="your_signed_message_here" --zenAddres="source_address_here" --signature="signature_here"
```

As a module:
```javascript
import { recoverPubKey } from 'zenclaim-recoverpubkey';

const options = { 
  message: "your_signed_message_here",
  zenAddres: "source_address_here",
  signature: "signature_here" 
};

recoverPubKey(options).then(result => {
  if (result.error) {
    console.error(result.error);
  } else {
    console.log(result);
  }
}).catch(error => {
  console.error(error.message);
});
```

#### Arguments/Options:  
The signed message and signature are required.  
Drop the dashes when creating an options object for module use.
```javascript
 --message="" (mandatory) 
 --zenAddress="" (mandatory)
 --signature="" (mandatory)
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose display arguments received
Short forms of arguments for command line 
  -ms="" -za="" -sg="" -h -v 
```

---

### zenclaim-claimmultisigaddress
Submit a claim for a ZEN multisig address. This tool helps you create and submit a claim for ZEN funds from a multisig address to a Base destination address. It also can generate the message to sign for multisig claims.



As a CLI:
```bash
npx zenclaim-claimmultisigaddress   --zenMultisigAddress:"multisig_address_here" --redeemScript="your_redeem_script_here" --detinationAddress="base_address_here"  --senderAddressPrivKey="base_senders_private_key" --signatures="[\"signature1\",\"signature2\",\"...\"]"
```
Note: adjust the quotes for the operating system you are using.

As a module:
```javascript
import { claimMultisigAddress } from 'zenclaim-claimmultisigaddress';

const options = {
  zenMultisigAddress:"multisig_address_here",
  destinationAddress: "base_destination_address",
  redeemScript: "redeem_script_here", 
  signatures: ["signature1", "signature2", "..."],
  senderAddressPrivKey: "base_senders_private_key"
};

claimMultisigAddress(options).then(result => {
  if (result.error) {
    console.error(result.error);
  } else {
    console.log(result);
  }
}).catch(error => {
  console.error(error.message);
});
```

#### Arguments/Options:  
The redeem script, Base destination address, and signatures are required.  
Drop the dashes when creating an options object for module use.
```javascript
 --zenMultisigAddress="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address) 
 --destinationAddress="0x.." (mandatory, claim destination Ethereum address on Base L2 in EIP-55 mixed-case checksum address encoding)
 --redeemScript="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address redeemScript) 
 --signatures='["",""]' (mandatory, n signatures of a n-of-m multisig address) 
 --senderAddressPrivKey="0x.." (mandatory, private key of Base address sending the transaction and paying the fee. must have enough funds for gas)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
 --buildmessage  build the message to sign. If present zenMultisigAddress, destinationAddress are required (include testnet if needed). Only the  message is returned, no transaction is sent.
Short forms of arguments for command lin
  -ma="" -da="" -ra="" -sg="" -pk="" -gf= -pf= -nt="" -h -v -b
```
The message to sign should consist of the word ZENCLAIM the base58check decoded representation of the multisig address and the destination Ethereum address on Base L2 in EIP-55 mixed-case checksum address encoding. The addresses must be in the format 0x{hex}.
Example "ZENCLAIM0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x1448283357e8FB6EA763a78836FFD5517149BF70"    
Use the --buildmessage feature to create the message to sign.    

Signatures must be created with the public key of each zenAddress used to create the multisig address. 
Only use the required number of signatures. e.g. a 3 of 5 multisig expects 3 of the signatures. Any other quantity will throw an error.  The signatures may be in any order in the array.



## Troubleshooting
If referencing the aliases of the modules does not resolve, the modules may be loaded by file names. The full path may be needed depending on where they were dowloaded.    
Locations relative to the repository folder:
```
zenclaim-seedtool: "bin/seedtool.js",
zenclaim-signtool: "bin/signtool.js",
zenclaim-verifymessage: "bin/verifymessage.js",
zenclaim-claimzenaddress: "bin/claimzenaddress.js",
zenclaim-recoverpubkey: "bin/recoverpubkey.js",
zenclaim-claimmultisigaddress: "bin/claimmultisigaddress.js"
```