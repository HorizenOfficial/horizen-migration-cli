#!/usr/bin/env node

import * as zen from "./claimzenutils.js"
import { verify } from "zenclaim-verifymessage/verifyutils.js"
import 'colors'

// HELP
const usage = `${'npx zenclaim-claimzenaddress  argument="" argument=""... '.cyan}
arguments 
 --zenAddress="" (mandatory, Horizen 1 Mainchain address) 
 --destinationAddress="0x.." (mandatory, Horizen 2 claim destination address starting with 0x) 
 --signature="" (mandatory signed message signature from zenAddress) 
 --senderAddressPrivKey="0x.." (mandatory, private key of Horizen 2 address sending the transaction and paying the fee)  
 --maxFeePerGas=int (optional, wei, default 20000000000) 
 --maxPriorityFeePerGas=int (optional, wei, default 20000000000) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
${'Short forms of arguments'.cyan} 
  -za="" -da="" -sg="" -pk="" gf= pf= -net="" -s -h -v
${'Claiming ZEN:'.cyan}
The message to sign should consist of the word ZENCLAIM and the destination address on Horizen 2 and should be signed with the public key of zenAddress
  Example "ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70"
`
// check for ERROR_DETAILS environment var - outputs lines for debugging
const ERROR_DETAILS = process.env.ERROR_DETAILS || false;

const long = ['--zenAddress', '--destinationAddress', '--signature', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose'];
const short = ['-za', '-da', '-sg', '-pk', '-gf', 'pf', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);
const flags = long.splice(-3).concat(short.splice(-3))


const main = process.argv[2];
const callHelp = process.argv.includes('--help', 2) || process.argv.includes('-h', 2) || main?.toLowerCase() == 'help';
if (!main || callHelp) {
  console.log(usage)
  process.exit();
}

// check for verbose argument
const verbose = process.argv.includes('--verbose', 2) || process.argv.includes('-v', 2);
if (verbose) console.log('ENV: ERROR_DETAILS'.red, ERROR_DETAILS);

const displayArg = (val) => {
  const status = val[1] || (flags.includes(val[0]) ? 'true' : 'missing or incorrect');
  console.log(`ARG ${val[0]} = ${status}`);
};
let zenAddress;
let destinationAddress;
let signature;
let senderAddressPrivKey;
let maxFeePerGas = 20000000000;
let maxPriorityFeePerGas = 20000000000;
let testnet;

let issue;

for (let i = 0; i < process.argv.length; i++) {
  const val = process.argv[i].split('=');
  if (i > 1 && verbose) displayArg(val);
  if (i > 1 && allowed.indexOf(val[0]) === -1) {
    console.log(`${val[0]} is not valid. For help: use --help or -h`.red);
    issue = true;
    break;
  }
  if (val[0] === '-za' || val[0] === '--zenAddress') zenAddress = val[1].replaceAll("'", '');
  if (val[0] === '-da' || val[0] === '--destinationAddress') destinationAddress = val[1].replaceAll("'", '');
  if (val[0] === '-sg' || val[0] === '--signature') signature = val[1].replaceAll("'", '');
  if (val[0] === '-pk' || val[0] === '--senderAddressPrivKey') senderAddressPrivKey = val[1].replaceAll("'", '');
  if (val[0] === '-gf' || val[0] === '--maxFeePerGas') maxFeePerGas = Number(val[1]);
  if (val[0] === '-pf' || val[0] === '--maxPriorityFeePerGas') maxPriorityFeePerGas = Number(val[1]);
  if (val[0] === '-nt' || val[0] === '--network') testnet = val[1];
}
if (issue) process.exit();
if (!zenAddress || !destinationAddress || !signature || !senderAddressPrivKey) {
  console.log('zenAddress, destinationAddress, signature, and senderAddressPrivKey are all required. For help: use --help or -h'.red);
  process.exit();
}

const network = testnet === 'testnet' || 0;


const claim = async () => {
  // validate
  if (!zen.isZenAddress(zenAddress, testnet, verbose)) {
    console.error("Not a valid zenAddress");
    process.exit();
  }
  if (!zen.isH2Address(destinationAddress)) {
    console.error("Not a valid destinationAddress");
    process.exit();
  }
  if (!zen.isH2PrivKey(senderAddressPrivKey)) {
    console.error("Not a valid senderAddressPrivKey");
    process.exit();
  }
  const message = `ZENCLAIM${destinationAddress}`
  if (!verify(message, zenAddress, signature)) {
    console.error("Not a valid signature for signed message");
    process.exit();
  }

  const addressCheck = await zen.checkClaimAddress(zenAddress, network, verbose);
  if (addressCheck.error) { console.error(addressCheck.error); process.exit(); }

  // claim
  try {
    const txHash = await zen.claimZen(zenAddress, destinationAddress, signature, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose);
    return txHash;
  } catch (error) {
    return { error: error.message }
  }
}
const result = await claim();
if (result.error) {
  console.error(result.error);
  process.exit();
}
// const output = stringify ? JSON.stringify(result, null, 1) : result;
// console.log(output);
console.log(txHash)
if (verbose) console.log('no errors');

