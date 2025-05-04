#!/usr/bin/env node

import { sign } from "../src/utils/signutils.js";
import { isEthAddress } from "../src/utils/claimutils.js";
import { ZENCLAIM_MESSAGE_PREFIX, ZENCLAIM_MESSAGE_PREFIX_TESTNET } from "../src/lib/contractConsts.js";
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
The message to sign should consist of the word ZENCLAIM and the destination address on Base
  Example "ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70"
See the multisig claim tool for the message to sign for multisig addresses. That tool can generate the message to sign for you.
`;

const long = ['--privKey', '--message', '--compressed', '--network', '--stringify', '--help', '--verbose'];
const short = ['-pk', '-ms', '-cp', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
  let options = {}

  for (let i = 0; i < args.length; i++) {
    const val = args[i].split('=');
    if (allowed.indexOf(val[0]) === -1) {
      console.error(`${val[0]} is not valid. For help: use --help or -h`.red);
      process.exit(1);
    }
    if (val[0] === '-pk' || val[0] === '--privKey') { options.privKey = val[1]; continue; }
    if (val[0] === '-ms' || val[0] === '--message') { options.message = val[1]; continue; }
    if (val[0] === '-cp' || val[0] === '--compressed') { options.compressed = val[1] == 'false' ? false : true; continue; }
    if (val[0] === '-nt' || val[0] === '--network') { options.network = val[1]; continue; }
    if (val[0] === '-s' || val[0] === '--stringify') { options.stringify = true; continue; }
    if (val[0] === '-v' || val[0] === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-signtool CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  if (!options.privKey || !options.message || options.message === '' || options.message === 'undefined' || options.message.length < 50) {
    console.error('private key and message are required. For help: use --help or -h'.red);
    process.exit(1);
  }

  return options;
}

// Function to sign a message
function signMessage(options) {
  if (options.verbose)  console.log("options=", options);
  const testnet = options.network === 'testnet' ? 1 : 0;

  try {
    // validation checks
    if (!options.privKey) throw new Error('Missing private key');
    if (!options.message) throw new Error('Missing message');
    const msg = options.message.split("0x");
    if(msg.length === 1) throw new Error('Message should contain the destination address with 0x prefix.');
    if(msg.length > 3) throw new Error('Invalid message. Check instructions');
    if(msg[0]!== ZENCLAIM_MESSAGE_PREFIX && msg[0] !== ZENCLAIM_MESSAGE_PREFIX_TESTNET) 
      throw new Error(`Message should begin with ${network ? ZENCLAIM_MESSAGE_PREFIX_TESTNET : ZENCLAIM_MESSAGE_PREFIX}`);
    const dest = `0x${msg[2] || msg[1]}`
    if (!isEthAddress(dest) ) throw new Error('Invalid destination address in message. Check instructions');
    if (msg.length === 3 && msg[1].length !== 40) throw new Error('Invalid message for multisig. Check build message instructions for zenclaim-claimmultisigaddress');


    const signature = sign(
      options.message,
      options.privKey,
      options.compressed || true,
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
  const callHelp = args.includes('--help') || args.includes('-h');
  if (callHelp || args.length === 0) {
    console.log(usage);
    process.exit(0);
  }

  const options = parseArguments(args);
  if (options.verbose) {
    console.log('Arguments received:'.cyan, options);
  }

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

// If the script is run directly, execute the main function
const argv = process.argv;
const isCLI = argv[0].includes('node') && argv[1].endsWith('signtool.js');
if (isCLI) {
  main(argv.slice(2));
}