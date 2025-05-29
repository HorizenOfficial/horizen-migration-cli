# Zenclaim CLI Tool

A command line utility for claiming existing ZEN migrated to Base. There are multiple tools included that may be used on the command line or as a node module in other Node.js applications.

[Overview](#overview)

[Tools Included](#tools-included)

[SECURITY CONSIDERATIONS](#security-considerations)

[Installation](#installation)

[Usage](#usage)

  - [zenclaim-seedtool](#zenclaim-seedtool)

  - [zenclaim-signtool](#zenclaim-signtool)

  - [zenclaim-verifymessage](#zenclaim-verifymessage)

  - [zenclaim-claimzenaddress](#zenclaim-claimzenaddress)

  - [zenclaim-recoverpubkey](#zenclaim-recoverpubkey)

  - [zenclaim-claimmultisigaddress](#zenclaim-claimmultisigaddress)

  - [zenclaim-deriveclaimdirectaddress](#zenclaim-deriveclaimdirectaddress)

  - [zenclaim-claimdirect](#zenclaim-claimdirect)
  
  - [zenclaim-deriveclaimdirectmultisig](#zenclaim-deriveclaimdirectmultisig)
  
  - [zenclaim-claimdirectmultisig](#zenclaim-claimdirectmultisig)

[Submitting a Claim For a ZEN Address](#submitting-a-claim-for-a-zen-address)

[Submitting a Claim for a Multisig Address](#submitting-a-claim-for-a-multisig-address)

[Troubleshooting](#troubleshooting)    
    

## Overview

A snapshot of all ZEN account balances was taken at a certain point in time and added to a smart contract on Base. A claim process was created to allow ZEN holders to claim their new ZEN by creating and submitting a claim.  There is a website to make simple claims (see horizen.io website). This tool supports every step of the process for more complex or bulk claims, including those involving multisig addresses.

* The general claim process is to create and sign a message with the private key of the ZEN address that contains the ZEN.  
* The message and a Base destination is then sent to a contract on the Base network after verifying the message and the balance.  
* The contract sends the amount found in the snapshot to the destination address on Base.

## Tools Included

Tools included allow you to:

- recover ZEN addresses and private keys from a seed phrase  
- sign a message with a private key  
- verify a signed message  
- submit a claim for a standard transparent address  
- submit a claim for a multisig address  
- return the public key recovered from a signed message

## **SECURITY CONSIDERATIONS**

This tool requires seed phrases and private keys on both ZEN and Base networks for some of the tools. Steps should be taken to protect the secret values in all environments. .  
Please follow these precautions to avoid leaking sensitive information:

* Disable shell history before running the tool to prevent secrets from being recorded:  
  `set +o history`  
* Avoid running in multi-user environments where other users can access the system process list. Command-line arguments, which may contain secrets, could be visible to other users.

Additional security best practices are beyond the scope of this guide.

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/download) version 20 or higher installed.

To install the package, clone the repository from github.

```
git clone https://github.com/HorizenOfficial/horizen-migration-cli.git
```

In the `horizen-migration-cli` folder created, install the node modules.

```
npm install
```

To test the installation, in the installation folder run.

```
npx zenclaim-signtool --help
```

## Usage

For ease of use, references have been created that point to the individual main files. These files support running as both command line (bash) or importing as a module.  The mapping may be found in the package.json file.

### zenclaim-seedtool

Derive ZEN addresses and keys from a seed phrase.  Most seed phrases are 24 words. Some older wallets used 12 words.  Any number of words are supported by the tool.  Be sure to enter words separated by a single space, with no leading or trailing spaces. The words, their order, and their case must exactly match the original.  Check the addresses returned match the source.

This returns a JSON object with multiple addresses and keys or an object with an error message.

Example Usage:

As a CLI:

```bash
npx zenclaim-seedtool --mnemonicPhrase="your seed phrase here" 
```

As a module:

```js
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

```js
  --mnemonicPhrase="" (mandatory, usually 12 or 24 words)
  --mnemonicPassword="" (optional, default "", seed password)
  --numAddresses=int (optional, default 5)
  --derivationPath="" (optional, default "m/44'/121'/0'/0/")
  --derivationAddressIndexOffset=int (optional, default 0, offset of last integer in derivation path)
  --network="mainnet||testnet" (optional, default "mainnet")
  --stringify (optional default array, array as JSON.stringify() output)
  --help  display this help
  --verbose display additional values to help debug
 // Short forms of arguments for the command line only
  -ph="" -pw="" -na= -dp="" -do="" -nt="" -s -h -v
```

Notes: help, stringify and short forms are only available in the CLI.

### zenclaim-signtool

Sign a special message with the private key of the ZEN source address. See instructions for building a message for a multisig address in the multisig tool as it has a different format.

The format of the message to sign is the word "ZENCLAIM" plus the address (checksum format) of the account on Base to receive the funds. The private key is from the address containing the ZEN at the time of the snapshot.  For testnet use “ZT2CLAIM”.

Returns an object with an address and signature or an object with an error message.

As a CLI

```bash
npx zenclaim-signtool --privKey="your_zen_private_key_here" --message="your_message_here"
```

As a module:

```js
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

```js
 --privKey="" (mandatory, WIF (Wallet Import Format) or raw format private key)
 --message="" (mandatory) 
 --compressed=true||false (optional, default true) 
 --network="mainnet||testnet" (optional, default mainnet)
 --stringify (optional JSON.stringify() output, default object {signature, address})
 --help  display this help
 --verbose  display additional values to help debug
// Short forms of arguments for the command line only
  -pk="" -ms="" -cp= -nt="" -s -h -v
```

The message to sign should consist of the word ZENCLAIM and the destination address on Base Example "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC" See the multisig claim tool for the message to sign for multisig addresses. That tool can generate a message to sign for you.   For testnet use “ZT2CLAIM”.

### zenclaim-verifymessage

Verify a message when passed a message, ZEN address, and signature.  
Returns either true or false on success or an object with an error message.

As a CLI:

```bash
npx zenclaim-verifymessage --message="your_signed_message_here" --zenAddress="your_znaddress_here" --signature="signature_here"
```

As a Module:

```js
import { verifyMessage } from 'zenclaim-verifymessage';

const options = {message: "message_here", zenAddress = "zen_address_here", signature = "signature_here"};

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

```js
 --message="" (mandatory) 
 --zenAddress="" (mandatory)
 --signature="" (mandatory)
 --network="mainnet||testnet" (optional, default mainnet)
 --help  display this help
 --verbose  display arguments received
// Short forms of arguments for command line 
  -ms="" -za="" -sg="" -h -v 
```

### zenclaim-claimzenaddress

Submit a claim for a standard ZEN transparent address.  
This validates the claim and sends a transaction to the smart contract on Base. The call requires access to the internet and uses the sender's private key.

There are default providers in the mainconfig.js file that may be changed.  
The sender does not have to be the destination address.  Be sure there are funds in the sender's address to cover gas fees. It will be checked prior to sending.

The ZEN address source, destination address on Base, message signature, and sender's private key are all required.

Returns the transaction hash on success or an object with an error message.

As a CLI:

```bash
npx zenclaim-claimzenaddress --zenAddress="source_address_here" --destinationAddress="base_address_here" --signature="from_signed_message" --senderAddressPrivKey="base_senders_private_key"
```

As a module:

```js
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

```js
 --zenAddress="" (mandatory, Horizen 1 Mainchain address) 
 --destinationAddress="0x.." (mandatory, claim destination Ethereum address on Base L2 starting with 0x) 
 --signature="" (mandatory signed message signature from zenAddress) 
 --senderAddressPrivKey="0x.." (mandatory, private key of Ethereum address sending the transaction and paying the fee)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
// Short forms of arguments for command line 
  -za="" -da="" -sg="" -pk="" -gf= -pf= -nt="" -h -v
```

The message to sign should consist of the word ZENCLAIM and the destination address (starting with 0x) on Base and should be signed with the public key of the ZEN address of the funds. Example "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC"

### zenclaim-recoverpubkey

Recover the public key of a ZEN address from a signed message. This tool extracts the public key and determines the x and y coordinates required by the claim smart contract.

The claim smart contract requires the public key of the claimed address in a special format. This command extracts the public key of the zen address from the message and message signature and determines the x and y coordinates. It is unlikely it would be used unless you are building a custom script or app to submit claims. The claim tools already perform this action.

Returns an object with the x and y coordinates or an object with an error message

As a CLI:

```bash
npx zenclaim-recoverpubkey --message="your_signed_message_here" --zenAddress="source_address_here" --signature="signature_here"
```

As a module:

```js
import { recoverPubKey } from 'zenclaim-recoverpubkey';

const options = { 
  message: "your_signed_message_here",
  zenAddress: "source_address_here",
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

```js
 --message="" (mandatory) 
 --zenAddress="" (mandatory)
 --signature="" (mandatory)
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose display arguments received
// Short forms of arguments for command line 
  -ms="" -za="" -sg="" -h -v 
```

### zenclaim-claimmultisigaddress

Submit a claim for a ZEN multisig address. This tool helps you create and submit a claim for ZEN funds from a multisig address to a Base destination address. It also can generate the message to sign for multisig claims.

As a CLI:

```bash
npx zenclaim-claimmultisigaddress --zenMultisigAddress="multisig_address_here" --redeemScript="your_redeem_script_here" --destinationAddress="base_address_here"  --senderAddressPrivKey="base_senders_private_key" --signatures="[\"signature1\",\"signature2\",\"...\"]"
```

Note: adjust the quotes for the operating system you are using.

As a module:

```js
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

```js
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
// Short forms of arguments for command line
  -ma="" -da="" -ra="" -sg="" -pk="" -gf= -pf= -nt="" -h -v -b
```

The message to sign should consist of the word “ZENCLAIM” the base58check-decoded representation of the multisig address and the destination Ethereum address on Base L2 in EIP-55 mixed-case checksum address encoding. The addresses must be in the format 0x{hex}. Example "ZENCLAIM0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x1448283357e8FB6EA763a78836FFD5517149BF70"  
Use the \--buildmessage feature to create the message to sign.  
Note:   For testnet use “ZT2CLAIM”.

Signatures must be created with the public key of each zenAddress used to create the multisig address. Only use the required number of signatures. e.g. a 3 of 5 multisig expects 3 of the signatures. Any other quantity will throw an error.  The signatures may be in any order in the array.


### zenclaim-deriveclaimdirectaddress

Deterministically generate a P2PKH ZEN address from a Base ETH address. 

As a CLI:

```bash
npx zenclaim-deriveclaimdirectaddress --baseEthAddress="<base_eth_address>" --network="testnet" 
```

Note: adjust the quotes for the operating system you are using.

As a module:

```js
import { deriveClaimDirectAddress } from 'zenclaim-deriveclaimdirectaddress';

const options = {
  baseEthAddress: "<base_eth_address>"
};

deriveClaimDirectAddress(options).then(result => {
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

The Base ETH address is required.  
Drop the dashes when creating an options object for module use.

```js
 --baseEthAddress="" (mandatory, Ethereum address on Base) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --verbose  display additional values to help check for errors

// Short forms of arguments for command line
  -a="" -nt="" -v
```

### zenclaim-claimdirect
This method distributes a balance from a derived ZEN address to the ETH address on Base. Derive a P2PKH ZEN address from the ETH address prior to the snapshot (use [zenclaim-deriveclaimdirectaddress](#zenclaim-deriveclaimdirectaddress)), and send the balance to this derived ZEN address.

The balance would be unspendable on Horizen 1 as no private key corresponding with the ZEN address exists, but funds would be locked in this address until distributed on Base.

As a CLI:

```bash
npx zenclaim-claimdirect --baseEthAddress="<base_eth_address>" --senderAddressPrivKey="<sender_private_key>" --network="testnet" 
```

Note: adjust the quotes for the operating system you are using.

As a module:

```js
import { claimDirect } from 'zenclaim-claimdirect';

const options = {
  baseEthAddress: "<base_eth_address>",
  senderAddressPrivKey: "<sender_private_key>"
};

claimDirect(options).then(result => {
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

The Base ETH address and sender private key are required.  
Drop the dashes when creating an options object for module use.

```js
 --baseEthAddress="" (mandatory, Ethereum address on Base) 
 --senderAddressPrivKey="" (mandatory, private key of Horizen 2 address sending the transaction and paying the fee)
 --maxFeePerGas=int (optional, wei) 
 --maxPriorityFeePerGas=int (optional, wei) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors

// Short forms of arguments for command line
  -a="" -pk="" -gf= -pf= -nt="" -h -v
```

### zenclaim-deriveclaimdirectmultisig
Deterministically generate a P2SH ZEN multisig address and redeem script from a Base ETH address and ZEN public key. 

As a CLI:

```bash
npx zenclaim-deriveclaimdirectmultisig --zenAddressPubKey="<zen_public_key>" --baseEthAddress="<base_eth_address>" --network="testnet" 
```

Note: adjust the quotes for the operating system you are using.

As a module:

```js
import { deriveClaimDirectMultisig } from 'zenclaim-deriveclaimdirectmultisig';

const options = {
  zenAddressPubKey: "<zen_public_key>",
  baseEthAddress: "<base_eth_address>"
};

deriveClaimDirectMultisig(options).then(result => {
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

The Base ETH address and ZEN public key are required.  
Drop the dashes when creating an options object for module use.

```js
 --zenAddressPubKey="" (mandatory, compressed or uncompressed public key of a ZEN P2PKH address)
 --baseEthAddress="" (mandatory, Ethereum address on Base) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --verbose  display additional values to help check for errors

// Short forms of arguments for command line
  pk="" -a="" -nt="" -v
```


### zenclaim-claimdirectmultisigaddress
This method distributes a balance from a derived ZEN multisig address to the ETH address on Base. Derive a P2SH ZEN multisig address from the ETH address prior to the snapshot (use [zenclaim-deriveclaimdirectmultisig](#zenclaim-deriveclaimdirectmultisig)), and send the balance to this derived ZEN multisig address.

As a CLI:

```bash
npx zenclaim-claimmultisigaddress --redeemScript="<redeem_script>" --baseEthAddress="<base_eth_address>" --senderAddressPrivKey="<sender_private_key>" --network="testnet" 
```

Note: adjust the quotes for the operating system you are using.

As a module:

```js
import { claimDirectMultisig } from 'zenclaim-claimdirectmultisig';

const options = {
  redeemScript: "<redeem_script>",
  baseEthAddress: "<base_eth_address>",
  senderAddressPrivKey: "<sender_private_key>"
};

claimDirectMultisig(options).then(result => {
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

The redeemscript, Base ETH address and sender private key are required.  
Drop the dashes when creating an options object for module use.

```js
 --redeemScript="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address redeemScript) 
 --baseEthAddress="" (mandatory, Ethereum address on Base)
 --senderAddressPrivKey="" (mandatory, private key of Base address sending the transaction and paying the fee. must have enough funds for gas)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors

// Short forms of arguments for command line
  -rs="" -a="" -pk="" -gf= -pf= -nt="" -h -v
```

---

## Submitting a Claim For a ZEN Address

```bash
### Quick Start Example (Transparent Address)
1.  **Create Message:** `ZENCLAIM0xYourBaseAddressHere`
2.  **Sign Message:** `npx zenclaim-signtool --privKey="YourPrivateKey" --message="ZENCLAIM0xYourBaseAddressHere"`
3.  **Claim ZEN:** `npx zenclaim-claimzenaddress --zenAddress="YourZenAddress" --destinationAddress="0xYourBaseAddressHere" --signature="YourMessageSignature" --senderAddressPrivKey="SendersBasePrivateKey"`
```

Below are the basic steps to submit a claim for ZEN transparent addresses using \`zenclaim-claimzenaddress\`.

1. **Prepare the Destination Address:** Identify the Base network address where you want to receive the ZEN. Ensure it is in the correct format (starting with \`0x\` and in checksum format).  
2. **Create the Message to Sign:**  
   * Construct the message by combining the word "ZENCLAIM" with your Base destination address.  
   * Example: \`ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC\`  
3. **Sign the Message Using zenclaim-signtool:**  
   * Use the \`zenclaim-signtool\` to sign the message created in the previous step.  
   * Provide your ZEN private key and the message to sign as arguments or options.  
   * Command Line Example: \`npx zenclaim-signtool \--privKey="your\_zen\_private\_key\_here" \--message="ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC"\`  
   * This step will provide you with a signature.  
4. **Submit the Claim Using zenclaim-claimzenaddress:**  
   * Use the \`zenclaim-claimzenaddress\` tool to submit the claim.  
   * Provide the source ZEN address, the destination Base address, the signature obtained from the previous step, and the sender's private key for the Base network.  
   * The sender's private key should be associated with an address that has sufficient funds to cover gas fees.  
   * Command Line Example (all on one line):   
     * `npx zenclaim-claimzenaddress --zenAddress="source_address_here" --destinationAddress="base_address_here" --signature="from_signed_message" --senderAddressPrivKey="base_senders_private_key"`  
   * This tool will validate the claim and send a transaction to the smart contract on Base.  
   * The transaction hash is returned when successful.  
5. **Verify the Transaction:** After submitting the claim, verify the transaction using the transaction hash returned in the previous step on the Base network using a block explorer (https://basescan.org/). Check that the ZEN has been transferred to your destination Base address.

Note:  For testnet use “ZT2CLAIM”.

## Alternatives

### No Private Key Access

If you don’t have the private key to sign the message, the owner/holder of the address private key may sign the message using another method available in the ZEN ecosystem, such as using the Sphere application.  
In this case:

* Either create and provide the message to the owner or instruct them what the message must contain.  
* Have the owner sign the message and return the signature.  
* Use the zenclaim-message tool to verify the message.  
* If the message valid, continue with **Submit the Claim Using zenclaim-claimzenaddress**

## Submitting a Claim for a Multisig Address
This example is for a 3 of 5 multisig. Only submit the required number of signatures.

Quick Start Example (Multisig Address)

```bash
### Quick Start Example (Multisig Address)
1. **Build Message:** `npx zenclaim-claimmultisigaddress --zenMultisigAddress="YourMultisigAddress" --destinationAddress="YourBaseAddress" --buildmessage`
2. **Sign Message:** Each required key holder signs the message returned from the previous step using their private key (e.g., with `npx zenclaim-signtool`).
3. **Claim ZEN:** `npx zenclaim-claimmultisigaddress --zenMultisigAddress="YourMultisigAddress" --redeemScript="YourRedeemScript" --destinationAddress="YourBaseAddress" --senderAddressPrivKey="SendersBasePrivateKey" --signatures="[\"Signature1\",\"Signature2\",\"Signature3\"]"`
```

Submitting a claim for a multisig address requires coordination with the holders of the private keys. The following steps detail the process for a multisig address requiring three signatures using the \`zenclaim-claimmultisigaddress\` tool.

1. **Identify the Destination Address:** Determine the Base network address where you want to receive the ZEN. Ensure it is in the correct format, starting with \`0x\` and in checksum format.  
2. **Gather Multisig Address and Redeem Script Information:**  
   * Obtain the ZEN multisig address for which you are claiming funds.  
   * Retrieve the corresponding redeem script for this multisig address.  
3. **Build the Message to Sign:**  
   * Use the \`zenclaim-claimmultisigaddress\` tool with the \`--buildmessage\` option to create the message each key holder must sign. This step requires the multisig address and the destination address.  
   * Command Line Example:

```bash
npx zenclaim-claimmultisigaddress --zenMultisigAddress="multisig_address_here" --destinationAddress="base_address_here" --buildmessage
```

   * The tool will return the exact message that must be signed by each key holder. This message will be in the format "ZENCLAIM{multisig\_address\_decoded}{destination\_address}".   For testnet use “ZT2CLAIM”.  
4. **Interact with Key Holders:**  
   * Share the message generated in the previous step with each of the three key holders.  
   * Instruct each key holder to sign the message using their respective private key and any appropriate tool (e.g., \`zenclaim-signtool\` or another signing method like the Sphere application).  
   * Request each key holder to provide you with their signature.  
5. **Collect Signatures:** Gather all three signatures from the respective key holders. Ensure each signature is correct. Optionally use the zenclaim-verifymessage tool to validate each message.  
6. **Submit the Multisig Claim:**  
   * Use the \`zenclaim-claimmultisigaddress\` tool to submit the claim.  
   * Provide the multisig address, the redeem script, the destination address, the three collected signatures in an array, and the sender's private key for the Base network (this address must have sufficient funds to cover gas fees).  
   * Command Line Example (all on one line):

```bash
npx zenclaim-claimmultisigaddress --zenMultisigAddress="multisig_address_here" --redeemScript="your_redeem_script_here" --destinationAddress="base_address_here" --senderAddressPrivKey="base_senders_private_key" --signatures="[\"signature1\",\"signature2\",\"signature3\"]"
```

   * Note: Adjust the quotes for the operating system you are using (the backslash escape character may not be needed).  In module use, signatures must be an array.  
7. **Verify the Transaction:**  
   * After submitting the claim, the tool will return a transaction hash if successful.  
   * Use this transaction hash to verify the transaction on the Base network using a block explorer like basescan.org.  
   * Confirm that the ZEN has been transferred to the destination Base address.

## Troubleshooting

If referencing the aliases of the modules does not resolve, the modules may be loaded by file names. The full path may be needed depending on where they were downloaded.  

Locations relative to the repository folder:

```
zenclaim-seedtool: "bin/seedtool.js",
zenclaim-signtool: "bin/signtool.js",
zenclaim-verifymessage: "bin/verifymessage.js",
zenclaim-claimzenaddress: "bin/claimzenaddress.js",
zenclaim-recoverpubkey: "bin/recoverpubkey.js",
zenclaim-claimmultisigaddress: "bin/claimmultisigaddress.js",
zenclaim-deriveclaimdirectaddress: "bin/deriveclaimdirectaddress.js",
zenclaim-deriveclaimdirectmultisig: "bin/deriveclaimdirectmultisig.js",
zenclaim-claimdirect: "bin/claimdirect.js",
zenclaim-claimdirectmultisig: "bin/claimdirectmultisig.js"
```
