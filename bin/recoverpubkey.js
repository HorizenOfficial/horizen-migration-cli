#!/usr/bin/env node

import { getPublicKeyFromSignature, verifyAndRecoverPubKey } from "../src/utils/recoverutils.js";
import { isEthAddress } from "../src/utils/claimutils.js";
import { ZENCLAIM_MESSAGE_PREFIX, ZENCLAIM_MESSAGE_PREFIX_TESTNET } from "../src/lib/contractConsts.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
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

// Function to parse arguments
function parseArguments(args) {
  const options = {}

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
  const network = (options.network === 'testnet') ? 1 : 0;

  try {
    if (!options.message) throw new Error('Missing message');
    if (!options.zenAddress) throw new Error('Missing zenAddress');
    if (!options.signature) throw new Error('Missing signature');

    const msg = options.message.split("0x");
    if (msg.length === 1) throw new Error('Message should contain the destination address with 0x prefix.');
    if (msg.length > 3) throw new Error('Invalid message. Check instructions');
    if (msg[0] !== ZENCLAIM_MESSAGE_PREFIX && msg[0] !== ZENCLAIM_MESSAGE_PREFIX_TESTNET)
      throw new Error(`Message should begin with ${network ? ZENCLAIM_MESSAGE_PREFIX_TESTNET : ZENCLAIM_MESSAGE_PREFIX}`);
    if (network === 1 && msg[0] !== ZENCLAIM_MESSAGE_PREFIX_TESTNET) throw new Error('Incorrect prefix testnet in message')
    if (network === 0 && msg[0] !== ZENCLAIM_MESSAGE_PREFIX) throw new Error('Incorrect prefix for mainnet in message')
    const dest = `0x${msg[2] || msg[1]}`
    if (!isEthAddress(dest)) throw new Error('Invalid destination address in message. Check instructions');
    if (msg.length === 3 && msg[1].length !== 40) throw new Error('Invalid message for multisig. Check build message instructions for zenclaim-claimmultisigaddress');

    const sigPubKey = getPublicKeyFromSignature(options.message, options.signature);
    const keys = verifyAndRecoverPubKey(options.zenAddress, sigPubKey, network, options.verbose);
    return keys;
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