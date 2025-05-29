#!/usr/bin/env node

import { sign } from "../src/utils/signutils.js";
import { checkHelp, listArgs, run, help, securityConsideration } from "../src/utils/claimutils.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
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
The message to sign should consist of the word ${ZENCLAIM_MESSAGE_PREFIX_TESTNET} and the destination address on Base
  Example "${ZENCLAIM_MESSAGE_PREFIX_TESTNET}0x1448283357e8FB6EA763a78836FFD5517149BF70"
See the multisig claim tool for the message to sign for multisig addresses. That tool can generate the message to sign for you.
${securityConsideration.yellow}
`;

const long = ['--privKey', '--message', '--compressed', '--network', '--stringify', '--help', '--verbose'];
const short = ['-pk', '-ms', '-cp', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
  let options = {
    compressed: true,
    network: "mainnet"
  }

  for (let i = 0; i < args.length; i++) {
    const [key, val] = args[i].split('=');
    if (allowed.indexOf(key) === -1) {
      console.error(`${key} is not valid. ${help}`.red);
      process.exit(1);
    }
    if (key === '-pk' || key === '--privKey') { options.privKey = val; continue; }
    if (key === '-ms' || key === '--message') { options.message = val; continue; }
    if (key === '-cp' || key === '--compressed') { options.compressed = val === 'false' ? false : true; continue; }
    if (key === '-nt' || key === '--network') { options.network = val; continue; }
    if (key === '-s' || key === '--stringify') { options.stringify = true; continue; }
    if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-signtool CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  if (!options.privKey || !options.message) {
    console.error(`private key and message are required. ${help}`.red);
    process.exit(1);
  }

  if (options.message.length < 50) {
    console.error(`message is expected to be at least 50 characters long. ${help}`.red);
    process.exit(1);   
  }

  return options;
}

// Function to sign a message
function signMessage(options) {
  if (options.verbose)  console.log("options=", options);
  const testnet = options.network === 'testnet';
  if (options.compressed === undefined) options.compressed = true;

  try {
    // validation checks
    if (!options.privKey) throw new Error('Missing private key');
    if (!options.message) throw new Error('Missing message');
    if (options.message.length < 50) throw new Error('Message is expected to be at least 50 characters long')

    const signature = sign(
      options.message,
      options.privKey,
      options.compressed,
      testnet,
      options.verbose);
    return signature;
  } catch (error) {
    if (options.verbose) console.log(error.message)
    return { error: error.message };
  }
}

// Main function for CLI
async function main(args) {
  checkHelp(args, usage);
  
  const options = parseArguments(args);
  listArgs(options);

  const result = signMessage(options);

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  const output = options?.stringify ? JSON.stringify(result) : result;
  if (options.verbose) console.log('no errors');
  console.log(output);
}

// Export the signMessage function for use as a module
export { signMessage };

// If the script is run directly, execute the main function'
run(process.argv,'signtool', main);
