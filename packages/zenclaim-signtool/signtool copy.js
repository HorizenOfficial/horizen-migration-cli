#!/usr/bin/env node

import * as zen from "./signutils.js"
import 'colors'

// HELP
const usage = `${'Usage: npx zenclaim-signtool --argument="" --argument="" ... '.cyan}
arguments 
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
`
const long = ['--privKey', '--message', '--compressed', '--network', '--stringify', '--help', '--verbose']
const short = ['-pk', '-ms', '-cp', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);
const flags = long.splice(-3).concat(short.splice(-3))

const displayArg = (val) => {
  const status = val[1] || (flags.includes(val[0]) ? 'true' : 'missing or incorrect');
  console.log(`ARG ${val[0]} = ${status}`);
};

// check for help
const main = process.argv[2];
const callHelp = process.argv.includes('--help', 2) || process.argv.includes('-h', 2) || main?.toLowerCase() == 'help';
if (!main || callHelp) {
  console.log(usage)
  process.exit();
}

// check for verbose argument
const verbose = process.argv.includes('--verbose', 2) || process.argv.includes('-v', 2);

let privKey;
let message;
let compressed = true;
let testnet;
let stringify = false;

let issue;
for (let i = 0; i < process.argv.length; i++) {
  const val = process.argv[i].split('=');
  if (i > 1 && verbose) displayArg(val);
  if (i > 1 && allowed.indexOf(val[0]) === -1) {
    console.log(`${val[0]} is not valid. For help: use --help or -h`.red);
    issue = true;
    break;
  }
  if (val[0] === '-pk' || val[0] === '--privKey') privKey = val[1];
  if (val[0] === '-ms' || val[0] === '--message') message = val[1];
  if (val[0] === '-cp' || val[0] === '--compressed') compressed = !!val[1];
  if (val[0] === '-nt' || val[0] === '--network') testnet = val[1];
  if (val[0] === '-s' || val[0] === '--stringify') stringify = true;
}
if (issue) process.exit();

if (!privKey || !message) {
  console.log('message and private key are required'.red);
  process.exit();
}

const network = testnet === 'testnet' || 0;

const signMessage = () => {
  if (verbose) console.log("message=", message)
  try {
    const signature = zen.signMessage(message, privKey, compressed, network, verbose);
    return signature;
  } catch (error) {
    return { error: error.message }
  }
}
const result = signMessage();
if (result.error) {
  console.error(result.error);
  process.exit();
}
const output = stringify ? JSON.stringify(result, null, 1) : result;
console.log(output);
if (verbose) console.log('no errors');

//TODO in case of WIF base58check validation should be performed for checksum, but not network) 

export { signMessage }