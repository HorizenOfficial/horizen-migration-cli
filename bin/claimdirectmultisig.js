#!/usr/bin/env node

import { isEthAddress, checkHelp, listArgs, checkFeeFormat, run, help } from "../src/utils/claimutils.js";
import { checkRedeemScript } from "../src/utils/multisigutils.js";
import { validPrivateKey } from "../src/utils/signutils.js";
import { submitDirectClaimMultisig } from '../src/utils/provider.js'
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-claimdirectmultisig  --argument="" --argument="" ... '.cyan}
arguments:
 --redeemScript="0x.." (mandatory, Horizen 1 Mainchain P2SH-Multisig address redeemScript) 
 --baseEthAddress="" (mandatory, Ethereum address on Base)
 --senderAddressPrivKey="0x.." (mandatory, private key of Base address sending the transaction and paying the fee. must have enough funds for gas)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
${'Short forms of arguments'.cyan} 
  -rs="" -a="" -pk="" -gf= -pf= -nt="" -h -v
${'Claiming ZEN:'.cyan}
`;

// Allowed arguments
const long = ['--redeemScript', '--baseEthAddress', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose'];
const short = ['-rs', '-a', '-pk', '-gf', '-pf', '-nt', '-h', '-v'];
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
        if (key === '-rs' || key === '--redeemScript') { options.redeemScript = val; continue; }
        if (key === '-a' || key === '--baseEthAddress') { options.baseEthAddress = val; continue; }
        if (key === '-pk' || key === '--senderAddressPrivKey') { options.senderAddressPrivKey = val; continue; }
        if (key === '-gf' || key === '--maxFeePerGas') { options.maxFeePerGas = Number(val); continue; }
        if (key === '-pf' || key === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = Number(val); continue; }
        if (key === '-nt' || key === '--network') { options.network = val; continue; }
        if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
    }

    if (options.verbose) console.log('zenclaim-claimdirectmultisig CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

    return options;
}

// Function to claim ZEN
async function claimDirectMultisig(options) {
    try {
        const { redeemScript, baseEthAddress, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose } = options;
        if (!redeemScript || !baseEthAddress || !senderAddressPrivKey) {
            const missing = 'redeemScript, baseEthAddress, and senderAddressPrivKey are all required.'
            if (options.isCLI)`${missing} ${help}`;
            throw new Error(missing);
        }

        const testnet = network === 'testnet';

        // Validate inputs
        if (!redeemScript.startsWith("0x")) {
            throw new Error("Prefix redeemScript with 0x")
        }
        // Remove 0x
        if (!checkRedeemScript(redeemScript.slice(2), verbose)) {
            throw new Error("Not a valid redeemScript");
        }

        if (!isEthAddress(baseEthAddress)) {
            throw new Error(`Not a valid Base ETH Address. ${!baseEthAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
        }

        if (!validPrivateKey(senderAddressPrivKey)) {
            throw new Error("Not a valid senderAddressPrivKey");
        }

        const mfpg = checkFeeFormat(maxFeePerGas);
        const mpfpg = checkFeeFormat(maxPriorityFeePerGas);

        // Claim ZEN
        const isTest = options?.isTest
        const txResult = await submitDirectClaimMultisig(redeemScript, baseEthAddress, senderAddressPrivKey, mfpg, mpfpg, testnet, verbose, isTest);
        return txResult;
    } catch (error) {
        return { error: error.message || 'Unable to create the transaction'.red };
    }
}

// Main function for CLI
async function main(args) {
    checkHelp(args, usage);

    const options = parseArguments(args);
    listArgs(options);

    try {
        const result = await claimDirectMultisig(options);
        console.log(result);
    } catch (error) {
        console.error(error.message.red);
        process.exit(1);
    }
}

// Export the claimDirectMultisig function for use as a module
export { claimDirectMultisig };

// If the script is run directly, execute the main function
run(process.argv, 'claimdirectmultisig.js', main);
