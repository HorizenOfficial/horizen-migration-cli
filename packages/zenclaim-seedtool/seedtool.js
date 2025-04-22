#!/usr/bin/env node

import * as zen from "./phraseutils.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const version = packageJson.version;

// ///////////////////////////////////////////////////////////////////
//  Display Horizen 1.0 derived addresses and keys from a seed phrase
// ///////////////////////////////////////////////////////////////////

// CLI usage instructions
const usage = `${'Usage: npx zenclaim-seedtool --argument1 --argument2... '.cyan}
arguments:
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
  -ph="" -pw="" -na= -dp="" -do= -nt="" -s -h -v
`;

// Function to parse CLI arguments
function parseArguments(args) {
    const long = ['--mnemonicPhrase', '--mnemonicPassword', '--numAddresses', '--derivationPath', '--derivationAddressIndexOffset', '--network', '--stringify', '--help', '--verbose'];
    const short = ['-ph', '-pw', '-na', '-dp', '-do', '-nt', '-s', '-h', '-v'];
    const allowed = long.concat(short);
    const options = {}

    for (let i = 0; i < args.length; i++) {
        const val = args[i].split('=');
        if (allowed.indexOf(val[0]) === -1) {
            console.error(`${val[0]} is not valid. For help: use --help or -h`.red);
            process.exit(1);
        }
        if (val[0] === '-ph' || val[0] === '--mnemonicPhrase') options.mnemonicPhrase = val[1];
        if (val[0] === '-pw' || val[0] === '--mnemonicPassword') options.mnemonicPassword = val[1];
        if (val[0] === '-na' || val[0] === '--numAddresses') options.numAddresses = Number(val[1]);
        if (val[0] === '-dp' || val[0] === '--derivationPath') options.derivationPath = val[1];
        if (val[0] === '-do' || val[0] === '--derivationAddressIndexOffset') options.derivationAddressIndexOffset = Number(val[1]);
        if (val[0] === '-nt' || val[0] === '--network') options.network = val[1];
        if (val[0] === '-s' || val[0] === '--stringify') options.stringify = true;
        if (val[0] === '-v' || val[0] === '--verbose') options.verbose = true;
    }
    if(options.verbose) console.log('zenclaim-seedtool CLI'.green, version.yellow, 'by Horizen Labs'.grey);


    if (!options.mnemonicPhrase) {
        console.error('Seed phrase is required. For help: use --help or -h'.red);
        process.exit(1);
    }

    return options;
}

// Function to derive addresses
async function deriveAddresses(options) {
    const network = (options.network === 'testnet' || options.nt == 'testnet') ? 1 : 0;
    if (!options.mnemonicPhrase && !options.ph) throw new Error('Seed phrase is required.');

    try {
        const addrs = await zen.deriveFromPhrase(
            options.numAddresses || options.na || 5,
            options.mnemonicPhrase || options.ph,
            options.mnemonicPassword || options.pw || "",
            options.derivationPath || options.dp || `m/44'/121'/0'/0/`,
            options.derivationAddressIndexOffset || options.do || 0,
            network,
            options.verbose || options.v || false,
        );
        
        if (addrs.error) {
            console.error(addrs.error.red);
            process.exit(1);
        }

        return options.stringify || options.s ? JSON.stringify(addrs, null, 2) : addrs;
    } catch (error) {
        console.error('Unable to complete'.red, error.message.red);
        if (process.env.ERROR_DETAILS) console.error(error);
        process.exit(1);
    }
}

// Main function for CLI
async function main(args) {
    const callHelp = args.includes('--help') || args.includes('-h');
    if (callHelp || args.length === 0) {
        console.log(usage);
        process.exit(0);
    }

    const options = parseArguments(args);
    const result = await deriveAddresses(options);
    console.log(result);
    if (options.verbose) console.log('no errors');
}

// Export the deriveAddresses function for use as a module
export { deriveAddresses };

// If the script is run directly, execute the main function
const argv = process.argv
const isCLI = argv[0].includes('node') && argv[1].endsWith('seedtool.js')
if (isCLI) {
        main(argv.slice(2));
}