#!/usr/bin/env node

import { isEthAddress, checkHelp, listArgs, run, help } from "../src/utils/claimutils.js";
import bs58check from "bs58check";
import createHash from "create-hash";
import 'colors';
import { readFileSync } from 'fs';
import zencashjs from "zencashjs";
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-deriveclaimdirectaddress  --argument="" --argument="" ... '.cyan}
arguments:
 --baseEthAddress="" (mandatory, Ethereum address on Base) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --verbose  display additional values to help check for errors

${'Short forms of arguments'.cyan} 
  -a="" -nt="" -v
${'Deriving ZEN address:'.cyan}
Derive a P2PKH zenAddress from ethAddress.
`;

// Allowed arguments
const long = ['--baseEthAddress', '--network'];
const short = ['-a', '-nt'];
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
        if (key === '-a' || key === '--baseEthAddress') { options.baseEthAddress = val; continue; }
        if (key === '-nt' || key === '--network') { options.network = val; continue; }
        if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
    }

    if (options.verbose) console.log('zenclaim-claimultisigaddress CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

    return options;
}

function deriveClaimDirectHorizenAddress(prefix, ethereumAddress) {
    // Remove "0x"
    const ethereumAddressBytes = ethereumAddress.slice(2);
    console.log(ethereumAddressBytes);
    return bs58check.encode(
        Buffer.from(
        prefix +
            createHash("rmd160")
            .update(
                createHash("sha256")
                .update(Buffer.from(ethereumAddressBytes, "hex"))
                .digest(),
            )
            .digest("hex"),
        "hex",
        ),
    );
}

// Function to derive claim ZEN address
function deriveClaimDirectAddress(options) {
    try {
        const { baseEthAddress, network } = options;

        // Validate the EIP-55 checksum of the Eth address
        if (!isEthAddress(baseEthAddress)) {
            throw new Error(`Not a valid Base ETH Address. ${!baseEthAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
        }

        const testnet = network === 'testnet';
        const prefix = testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash;

        const zenAddress = deriveClaimDirectHorizenAddress(prefix, baseEthAddress);

        return zenAddress;
    } catch (error) {
        return { error: error.message || 'Unable to derive a ZEN address'.red };
    }
}

// Main function for CLI
async function main(args) {
    checkHelp(args, usage);

    const options = parseArguments(args);
    listArgs(options);

    try {
        const result = deriveClaimDirectAddress(options);
        console.log(result);
    } catch (error) {
        console.error(error.message.red);
        process.exit(1);
    }
}

// Export the claimZen function for use as a module
export { deriveClaimDirectAddress };

// If the script is run directly, execute the main function
run(process.argv, 'deriveclaimdirectaddress', main);
