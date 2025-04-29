#!/usr/bin/env node

import * as zen from "./zenClaim/claimzenutils.js";
import { findSenderBalance, submitClaim } from './zenClaim/rpc.js'
import { ZENCLAIM_MESSAGE_PREFIX, ZENCLAIM_MESSAGE_PREFIX_TESTNET } from "./zenClaim/contractConsts.js";
import 'colors';

// HELP
const usage = `${'npx zenclaim-claimzenaddress --argument="" --argument="" ... '.cyan}
arguments:
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
  -za="" -da="" -sg="" -pk="" -gf= -pf= -nt="" -h -v
${'Claiming ZEN:'.cyan}
The message to sign should consist of the word ZENCLAIM and the destination address on Horizen 2 and should be signed with the public key of zenAddress
  Example "ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70"
`;

// Allowed arguments
const long = ['--zenAddress', '--destinationAddress', '--signature', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose'];
const short = ['-za', '-da', '-sg', '-pk', '-gf', '-pf', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
  let options = {
    zenAddress: null,
    destinationAddress: null,
    signature: null,
    senderAddressPrivKey: null,
    maxFeePerGas: 20000000000,
    maxPriorityFeePerGas: 20000000000,
    network: "mainnet",
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const val = args[i].split('=');
    if (allowed.indexOf(val[0]) === -1) {
      console.error(`${val[0]} is not valid. For help: use --help or -h`.red);
      process.exit(1);
    }
    if (val[0] === '-za' || val[0] === '--zenAddress') { options.zenAddress = val[1]; continue;}
    if (val[0] === '-da' || val[0] === '--destinationAddress') { options.destinationAddress = val[1]; continue; }
    if (val[0] === '-sg' || val[0] === '--signature') { options.signature = args[i].slice(args[i].indexOf('=') + 1); continue; }
    if (val[0] === '-pk' || val[0] === '--senderAddressPrivKey') { options.senderAddressPrivKey = val[1]; continue; }
    if (val[0] === '-gf' || val[0] === '--maxFeePerGas') { options.maxFeePerGas = Number(val[1]); continue; }
    if (val[0] === '-pf' || val[0] === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = Number(val[1]); continue; }
    if (val[0] === '-nt' || val[0] === '--network') { options.network = val[1]; continue; }
    if (val[0] === '-v' || val[0] === '--verbose') { options.verbose = true; continue; }
  }

  if (!options.zenAddress || !options.destinationAddress || !options.signature || !options.senderAddressPrivKey) {
    console.error('zenAddress, destinationAddress, signature, and senderAddressPrivKey are all required. For help: use --help or -h'.red);
    process.exit(1);
  }

  return options;
}

// Function to claim ZEN
async function claimZen(options) {
  const { zenAddress, destinationAddress, signature, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose } = options;
  const testnet = network === 'testnet' ? 1 : 0;
  try {
    // Validate inputs
    if (!zen.isZenAddress(zenAddress, testnet, false, verbose)) {
      throw new Error("Not a valid zenAddress");
    }
    if (!zen.isH2Address(destinationAddress)) {
      throw new Error("Not a valid destinationAddress");
    }
    if (!zen.isH2PrivKey(senderAddressPrivKey)) {
      throw new Error("Not a valid senderAddressPrivKey");
    }
    const prefix = testnet ? ZENCLAIM_MESSAGE_PREFIX_TESTNET : ZENCLAIM_MESSAGE_PREFIX;
    const message = `${prefix}${destinationAddress}`;
    if (!zen.verifyMessage(message, zenAddress, signature)) {
      throw new Error("Not a valid signature for signed message");
    }
    const pubKeyCoords = zen.getPubKeyInfo(message, zenAddress, signature, testnet, verbose);
    if (pubKeyCoords.error) {
      throw new Error(pubKeyCoords.error);
    }

    const vaultAddress = await zen.checkClaimAddress(zenAddress, testnet, verbose);
    if (vaultAddress.error) {
      throw new Error(vaultAddress.error);
    }

    const senderEthBalance = await findSenderBalance(senderAddressPrivKey, testnet, verbose);
    if (senderEthBalance.error) {
      throw new Error(senderEthBalance.error);
    }
    if (senderEthBalance.balance < maxFeePerGas) {
      throw new Error(`Not enough funds in sender address to pay gas. Sender balance: ${senderEthBalance.balance}, required(gwei): ${maxFeePerGas}`);
    }
    if (verbose) console.log('Sender balance is enough to pay gas (gwei): ', senderEthBalance.balance.toString());

    // Claim ZEN
    const txHash = await submitClaim(zenAddress, destinationAddress, signature, pubKeyCoords, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, testnet, verbose);
    return txHash;
  } catch (error) {
    throw new Error(error.message);
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

  try {
    const result = await claimZen(options);
    console.log(result);
    if (options.verbose) console.log('no errors');
  } catch (error) {
    console.error(error.message.red);
    process.exit(1);
  }
}

// Export the claimZen function for use as a module
export { claimZen };

// If the script is run directly, execute the main function
const argv = process.argv;
const isCLI = argv[0].includes('node') && argv[1].endsWith('claimzenaddress.js');
if (isCLI) {
  main(argv.slice(2));
}