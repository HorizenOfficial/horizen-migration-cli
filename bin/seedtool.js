#!/usr/bin/env node

import { deriveFromPhrase } from "../src/utils/phraseutils.js";
import { checkHelp, listArgs, run, help, securityConsideration } from "../src/utils/claimutils.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// ///////////////////////////////////////////////////////////////////
//  Display Horizen 1.0 derived addresses and keys from a seed phrase
// ///////////////////////////////////////////////////////////////////

// CLI usage instructions
const usage = `${'Usage: npx zenclaim-seedtool --mnemonicPhrase="" ... '.cyan}
arguments:
  --mnemonicPhrase="" (${'mandatory'.magenta} usually 12 or 24 words)
  --mnemonicPassword="" (optional, default "", seed password)
  --numAddresses=int (optional, default 5)
  --derivationPath="" (optional, default "m/44'/121'/0'/0/")
  --derivationAddressIndexOffset=int (optional, default 0, offset of last integer in derivation path)
  --network="mainnet||testnet" (optional, default "mainnet")
  --stringify (optional default array, array as JSON.stringify() output)
  --help  display this help
  --verbose display additional values to help 
  debug
  ${'Short forms of arguments'.cyan} 
  -ph="" -pw="" -na= -dp="" -do= -nt="" -s -h -v
  ${securityConsideration.yellow}
`;

// Function to parse CLI arguments
function parseArguments(args) {
    const long = ['--mnemonicPhrase', '--mnemonicPassword', '--numAddresses', '--derivationPath', '--derivationAddressIndexOffset', '--network', '--stringify', '--help', '--verbose'];
    const short = ['-ph', '-pw', '-na', '-dp', '-do', '-nt', '-s', '-h', '-v'];
    const allowed = long.concat(short);
    const options = {}

    for (let i = 0; i < args.length; i++) {
        const [key, val] = args[i].split('=');
        if (allowed.indexOf(key) === -1) {
            console.error(`${key} is not valid. ${help}`.red);
            process.exit(1);
        }
        if (key === '-ph' || key === '--mnemonicPhrase') { options.mnemonicPhrase = val; continue; }
        if (key === '-na' || key === '--numAddresses') { options.numAddresses = Number(val); continue; }
        if (key === '-pw' || key === '--mnemonicPassword') { options.mnemonicPassword = val; continue; }
        if (key === '-na' || key === '--numAddresses') { options.numAddresses = Number(val); continue; }
        if (key === '-dp' || key === '--derivationPath') { options.derivationPath = val;; continue; }
        if (key === '-do' || key === '--derivationAddressIndexOffset') { options.derivationAddressIndexOffset = Number(val); continue; }
        if (key === '-nt' || key === '--network') { options.network = val; continue; }
        if (key === '-s' || key === '--stringify') { options.stringify = true; continue; }
        if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
    }
    if (options.verbose) console.log('zenclaim-seedtool CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);


    if (!options.mnemonicPhrase) {
        console.error(`Seed phrase is required. ${help}`.red);
        process.exit(1);
    }

    return options;
}

// Function to derive addresses
async function deriveAddresses(options) {
    try {
        const testnet = options.network === 'testnet';
        if (!options.mnemonicPhrase) throw new Error('Seed phrase is required.');
        if (options?.numAddresses && (isNaN(options.numAddresses) || options.numAddresses < 0)) 
            throw new Error('Number of addresses should be a number greater than 0.');
        if (options?.derivationAddressIndexOffset && (isNaN(options.derivationAddressIndexOffset) || options.derivationAddressIndexOffset < 0)) 
            throw new Error('derivationAddressIndexOffset should be a non-negative number.');

        const addrs = await deriveFromPhrase(
            options.numAddresses || 5,
            options.mnemonicPhrase,
            options.mnemonicPassword || "",
            options.derivationPath || `m/44'/121'/0'/0/`,
            options.derivationAddressIndexOffset || 0,
            testnet,
            options.verbose || false,
        );
        return options.stringify ? JSON.stringify(addrs, null, 1) : addrs;
    } catch (err) {
        if (options.verbose) console.log(err.message)
        return { error: err.message };
    }
}

// Main function for CLI
async function main(args) {
    checkHelp(args, usage);
  
    const options = parseArguments(args);
    listArgs(options);
  
    const result = await deriveAddresses(options);

    if (result.error) {
        console.error(result.error.red);
        process.exit(1);
    }

    const output = options?.stringify ? JSON.stringify(result) : result;
    if (options.verbose) console.log('no errors');
    console.log(output);
}

// Export the deriveAddresses function for use as a module
export { deriveAddresses };

// If the script is run directly, execute the main function
run(process.argv,'seedtool.js', main);
