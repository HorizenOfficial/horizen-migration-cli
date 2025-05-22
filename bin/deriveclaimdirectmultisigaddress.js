#!/usr/bin/env node

import { isEthAddress, checkHelp, listArgs, run, help } from "../src/utils/claimutils.js";
import 'colors';
import { readFileSync } from 'fs';
import zencashjs from "zencashjs";
import { createHash } from "crypto";
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-deriveclaimdirectmultisigaddress  --argument="" --argument="" ... '.cyan}
arguments:
 --zenAddressPubKey="" (mandatory, compressed or uncompressed public key of a ZEN P2PKH address)
 --baseEthAddress="" (mandatory, Ethereum address on Base) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --verbose  display additional values to help check for errors

${'Short forms of arguments'.cyan} 
  -pk="" -a="" -nt="" -v
${'Claiming ZEN:'.cyan}
Derive a P2SH zenMultisigAddress from ethAddress.
`;

// Allowed arguments
const long = ['--zenAddressPubKey', '--baseEthAddress', '--network'];
const short = ['-pk', '-a', '-nt'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
    const options = { isCLI: true }

    for (let i = 0; i < args.length; i++) {
        const [key, val] = args[i].split('=');
        if (allowed.indexOf(key) === -1) {
            console.error(`${key} is not valid. ${help}`.red);
            process.exit(1);
        }
        if (key === '-pk' || key === '--zenAddressPubKey') { options.zenAddressPubKey = val; continue; }
        if (key === '-a' || key === '--baseEthAddress') { options.baseEthAddress = val; continue; }
        if (key === '-nt' || key === '--network') { options.network = val; continue; }
        if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
    }

    if (options.verbose) console.log('zenclaim-deriveclaimdirectmultisigaddress CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

    return options;
}

function compressZenAddressPublicKey(pubKey) {
    // Check if pubkey is compressed
    if (pubKey.length === 66 && (pubKey.startsWith('02') || pubKey.startsWith('03'))) {
        return pubKey;
    }

    // Check if valid uncompressed pubkey
    if (!pubKey.startsWith('04') || pubKey.length !== 130) {
        throw new Error('Invalid uncompressed public key');
    }

    const x = uncompressedKey.slice(2, 66);
    const y = uncompressedKey.slice(66);
    const yLastByte = parseInt(y.slice(-2), 16);
  
    // Check if Y is even or odd
    const prefix = (yLastByte % 2 === 0) ? '02' : '03';
  
    const compressedKey = prefix + x;
    return compressedKey;
}

function deriveClaimDirectMultisigHorizenPubKey(ethereumAddress) {
    const compressedPubKeyIdentifier = "02";
    const ethAddressHexString = ethAddressToHexString(ethereumAddress);
    return (
        compressedPubKeyIdentifier +
        createHash("sha256")
        .update(Buffer.from(ethAddressHexString, "hex"))
        .digest("hex")
    );
}
  
function createClaimDirectMultisigRedeemScript(pubKey, derivedPubKey) {
    console.log('public key', pubKey);
    console.log('derived', derivedPubKey)
    return zencashjs.address.mkMultiSigRedeemScript(
        [pubKey, derivedPubKey],
        1,
        2,
    );
}

// Function to derive claim multisig ZEN address
function deriveClaimDirectMultisigAddress(options) {
    try {
        const { zenAddressPubKey, baseEthAddress, network } = options;

        // Validate the EIP-55 checksum of the Eth address
        if (!isEthAddress(baseEthAddress)) {
            throw new Error(`Not a valid Base ETH Address. ${!baseEthAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
        }

        const pubKeyHorizenCompressed = compressZenAddressPublicKey(zenAddressPubKey);

        const testnet = network === 'testnet';
        const scriptHash = testnet ? zencashjs.config.testnet.scriptHash : zencashjs.config.mainnet.scriptHash

        // claimDirectMultisig derived Addresses
        const claimDirectMultisigEthereumDerivedRedeemScript = createClaimDirectMultisigRedeemScript(
            pubKeyHorizenCompressed,
            deriveClaimDirectMultisigHorizenPubKey(baseEthAddress),
        );
        const claimDirectMultisigEthereumDerivedAddress = zencashjs.address.multiSigRSToAddress(
            claimDirectMultisigEthereumDerivedRedeemScript,
            scriptHash
        );

        return { 
            redeemScript: claimDirectMultisigEthereumDerivedRedeemScript, 
            zenMultisigAddress: claimDirectMultisigEthereumDerivedAddress
        };
    } catch (error) {
        return { error: error.message || 'Unable to derive a ZEN multisig address'.red };
    }
}

// Main function for CLI
async function main(args) {
    checkHelp(args, usage);

    const options = parseArguments(args);
    listArgs(options);

    try {
        const result = await deriveClaimDirectMultisigAddress(options);
        console.log(result);
    } catch (error) {
        console.error(error.message.red);
        process.exit(1);
    }
}

// Export the claimZen function for use as a module
export { deriveClaimDirectMultisigAddress };

// If the script is run directly, execute the main function
run(process.argv, 'deriveclaimdirectmultisigaddress.js', main);
