#!/usr/bin/env node

import * as zen from "./recoverutils.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'Usage: npx zenclaim-recoverpubkey --argument="" --argument="" ... '.cyan}
arguments:
 --message="" (mandatory) 
 --zenAddress="" (mandatory)
 --signature="" (mandatory)
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose display arguments received
${'Short forms of arguments'.cyan} 
  -ms="" -za="" -sg="" -h -v 
`;

// Allowed arguments
const long = ['--message', '--zenAddress', '--signature', '--network', '--help', '--verbose'];
const short = ['-ms', '-za', '-sg', '-nt', '-h', '-v'];
const allowed = long.concat(short);
// const flags = long.splice(-3).concat(short.splice(-3));

// Function to parse arguments
function parseArguments(args) {
  let options = {
    message: null,
    zenAddress: null,
    signature: null,
    network: null,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const val = args[i].split('=');
    if (allowed.indexOf(val[0]) === -1) {
      console.error(`${val[0]} is not valid. For help: use --help or -h`.red);
      process.exit(1);
    }
    if (val[0] === '-ms' || val[0] === '--message') { options.message = val[1]; continue; }
    if (val[0] === '-za' || val[0] === '--zenAddress') { options.zenAddress = val[1]; continue; }
    if (val[0] === '-sg' || val[0] === '--signature') { options.signature = val[1]; continue; }
    if (val[0] === '-nt' || val[0] === '--network') { options.network = val[1]; continue; }
    if (val[0] === '-v' || val[0] === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-recoverpubkey CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  if (!options.message || !options.zenAddress || !options.signature) {
    console.error('message, zenAddress, and signature are all required'.red);
    process.exit(1);
  }

  return options;
}

// Function to verify the message and recover the public key
function recoverPubkey(options) {
  const network = (options.network === 'testnet' || options.nt == 'testnet') ? 1 : 0;

  try {
    const sigPubKey = zen.getPublicKeyFromSignature(options.message, options.signature);
    const valid = zen.verifyAndRecoverPubKey(options.zenAddress, sigPubKey, network, options.verbose);
    return valid;
  } catch (error) {
    return { error: error.message || 'Unable to verify the signature'.red };
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
  if (options.verbose) {
    console.log('Arguments received:'.cyan, options);
  }

  const result = recoverPubkey(options);
  if (result?.error) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(result);
}

// Export the function for use as a module
export { recoverPubkey };

// If the script is run directly, execute the main function
const argv = process.argv;
const isCLI = argv[0].includes('node') && argv[1].endsWith('recoverpubkey.js');
if (isCLI) {
  main(argv.slice(2));
}