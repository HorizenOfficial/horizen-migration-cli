#!/usr/bin/env node

import { isEthAddress, checkHelp, listArgs, run, help, ethAddressToHexString, isValidPubKey } from "../src/utils/claimutils.js";
import 'colors';
import { readFileSync } from 'fs';
import zencashjs from "zencashjs";
import { createHash } from "crypto";
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-deriveclaimdirectmultisig  --argument="" --argument="" ... '.cyan}
arguments:
 --zenAddressPubKey="" (mandatory, compressed or uncompressed public key of a ZEN P2PKH address)
 --baseEthAddress="" (mandatory, Ethereum address on Base) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --verbose  display additional values to help check for errors

${'Short forms of arguments'.cyan} 
  -pk="" -a="" -nt="" -v
${'Claiming ZEN:'.cyan}
Derive a P2SH zenMultisigAddress and redeemScript from baseEthAddress.
- Send ZEN to this address before the snapshot
- Claim from this address after the snapshot using the contract method or CLI command claimdirectmultisig
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

    if (options.verbose) console.log('zenclaim-deriveclaimdirectmultisig CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

    return options;
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
    return zencashjs.address.mkMultiSigRedeemScript(
        [pubKey, derivedPubKey],
        1,
        2,
    );
}

function deriveClaimDirectMultisigAddress(redeemScript, isTestnet) {
    const scriptHash = isTestnet ? zencashjs.config.testnet.scriptHash : zencashjs.config.mainnet.scriptHash;

    return zencashjs.address.multiSigRSToAddress(redeemScript, scriptHash);
}

// Function to derive claim multisig ZEN address and redeem script
function deriveClaimDirectMultisig(options) {
    try {
        const { zenAddressPubKey, baseEthAddress, network } = options;

        // Validate the EIP-55 checksum of the Eth address
        if (!isEthAddress(baseEthAddress)) {
            throw new Error(`Not a valid Base ETH Address. ${!baseEthAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
        }

        // Validate the Horizen pubkey
        if (!isValidPubKey(zenAddressPubKey)) {
            throw new Error(`Not a valid ZEN address public key`);
        }

        const testnet = network === 'testnet';

        const claimDirectMultisigEthereumDerivedRedeemScript = createClaimDirectMultisigRedeemScript(
            zenAddressPubKey,
            deriveClaimDirectMultisigHorizenPubKey(baseEthAddress),
        );
        const claimDirectMultisigEthereumDerivedAddress = deriveClaimDirectMultisigAddress(
            claimDirectMultisigEthereumDerivedRedeemScript,
            testnet
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
        const result = await deriveClaimDirectMultisig(options);
        console.log(result);
    } catch (error) {
        console.error(error.message.red);
        process.exit(1);
    }
}

// Export the claimZen function for use as a module
export { deriveClaimDirectMultisigAddress, deriveClaimDirectMultisig };

// If the script is run directly, execute the main function
run(process.argv, 'deriveclaimdirectmultisig.js', main);
