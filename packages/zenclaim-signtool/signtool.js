#!/usr/bin/env node

import * as zen from "./signutils.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'Usage: npx zenclaim-signtool --argument="" --argument="" ... '.cyan}
arguments:
 --privKey="" (mandatory, WIF (Wallet Import Format) or raw format private key)
 --message="" (mandatory) 
 --compressed=true||false (optional, default true) 
 --network="mainnet||testnet" (optional, default mainnet)
 --stringify (optional JSON.stringify() output, default object {signature, address})
 --help  display this help
 --verbose  display additional values to help debug
${'Short forms of arguments'.cyan} 
  -pk="" -ms="" -cp= -nt="" -s -h -v
${'Claiming ZEN:'.cyan}
The message to sign should consist of the word ZENCLAIM and the destination address on Horizen 2
  Example "ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70"
See the multisig claim tool for the message to sign for multisig addresses. That tool can generate the message to sign for you.
`;

const long = ['--privKey', '--message', '--compressed', '--network', '--stringify', '--help', '--verbose'];
const short = ['-pk', '-ms', '-cp', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
  let options = {
    privKey: null,
    message: null,
    compressed: true,
    network: "mainnet",
    stringify: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const val = args[i].split('=');
    if (allowed.indexOf(val[0]) === -1) {
      console.error(`${val[0]} is not valid. For help: use --help or -h`.red);
      process.exit(1);
    }
    if (val[0] === '-pk' || val[0] === '--privKey') { options.privKey = val[1]; continue; }
    if (val[0] === '-ms' || val[0] === '--message') { options.message = val[1]; continue; }
    if (val[0] === '-cp' || val[0] === '--compressed') { options.compressed = val[1] === 'true'; continue; }
    if (val[0] === '-nt' || val[0] === '--network') { options.network = val[1]; continue; }
    if (val[0] === '-s' || val[0] === '--stringify') { options.stringify = true; continue; }
    if (val[0] === '-v' || val[0] === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-signtool CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  if (!options.privKey || !options.message) {
    console.error('message and private key are required'.red);
    process.exit(1);
  }

  return options;
}

// Function to sign a message
function signMessage(message, privKey, compressed, network, verbose) {
  if (verbose) console.log("message=", message);
  try {
    const signature = zen.signMessage(message, privKey, compressed, network, verbose);
    return signature;
  } catch (error) {
    return { error: error.message };
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

  const network = options.network === 'testnet' ? 1 : 0;
  const result = signMessage(options.message, options.privKey, options.compressed, network, options.verbose);

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  const output = options.stringify ? JSON.stringify(result, null, 2) : result;
  console.log(output);
  if (options.verbose) console.log('no errors');
}

// Export the signMessage function for use as a module
export { signMessage };

// If the script is run directly, execute the main function
const argv = process.argv;
const isCLI = argv[0].includes('node') && argv[1].endsWith('signtool.js');
if (isCLI) {
  main(argv.slice(2));
}