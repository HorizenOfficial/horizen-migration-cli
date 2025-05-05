#!/usr/bin/env node

import { isZenAddress, isEthAddress, isEthPrivKey, verifySignedMessage, getPubKeyInfo, checkHelp, listArgs, run, help} from "../src/utils/claimutils.js";
import { submitClaim } from '../src/utils/provider.js'
import { ZENCLAIM_MESSAGE_PREFIX, ZENCLAIM_MESSAGE_PREFIX_TESTNET } from "../src/lib/contractConsts.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-claimzenaddress --argument="" --argument="" ... '.cyan}
arguments:
 --zenAddress="" (mandatory, Horizen 1 Mainchain address) 
 --destinationAddress="0x.." (mandatory, claim destination Ethereum address on Base L2 starting with 0x) 
 --signature="" (mandatory signed message signature from zenAddress) 
 --senderAddressPrivKey="0x.." (mandatory, private key of Ethereum address sending the transaction and paying the fee)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
${'Short forms of arguments'.cyan} 
  -za="" -da="" -sg="" -pk="" -gf= -pf= -nt="" -h -v
${'Claiming ZEN:'.cyan}
The message to sign should consist of the word ZENCLAIM and the destination address (starting with 0x) on Base  and should be signed with the public key of the zenAddress
  Example "ZENCLAIM0x1448283357e8FB6EA763a78836FFD5517149BF70"
`;

// Allowed arguments
const long = ['--zenAddress', '--destinationAddress', '--signature', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose'];
const short = ['-za', '-da', '-sg', '-pk', '-gf', '-pf', '-nt', '-s', '-h', '-v'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
  const options = { isCLI: true };

  for (let i = 0; i < args.length; i++) {
    const val = args[i].split('=');
    if (allowed.indexOf(val[0]) === -1) {
      console.error(`${val[0]} is not valid. ${help}`.red);
      process.exit(1);
    }
    if (val[0] === '-za' || val[0] === '--zenAddress') { options.zenAddress = val[1]; continue; }
    if (val[0] === '-da' || val[0] === '--destinationAddress') { options.destinationAddress = val[1]; continue; }
    if (val[0] === '-sg' || val[0] === '--signature') { options.signature = args[i].slice(args[i].indexOf('=') + 1); continue; }
    if (val[0] === '-pk' || val[0] === '--senderAddressPrivKey') { options.senderAddressPrivKey = val[1]; continue; }
    if (val[0] === '-gf' || val[0] === '--maxFeePerGas') { options.maxFeePerGas = Number(val[1]); continue; }
    if (val[0] === '-pf' || val[0] === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = Number(val[1]); continue; }
    if (val[0] === '-nt' || val[0] === '--network') { options.network = val[1]; continue; }
    if (val[0] === '-v' || val[0] === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-claimszenaddress CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  return options;
}

// Function to claim ZEN
async function claimZen(options) {
  try {
    const { zenAddress, destinationAddress, signature, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose } = options;
    if (!zenAddress || !destinationAddress || !signature || !senderAddressPrivKey) {
      const missing = 'zenAddress, destinationAddress, signature, and senderAddressPrivKey are all required.';
      if (options.isCLI) `${missing} ${help}`;
      throw new Error(missing);
    }
    const testnet = network === 'testnet' ? 1 : 0;
    // Validate inputs
    if (!isZenAddress(zenAddress, testnet, false, verbose)) {
      throw new Error("Not a valid zenAddress");
    }
    if (!isEthAddress(destinationAddress)) {
      throw new Error("Not a valid destinationAddress");
    }
    if (!isEthPrivKey(senderAddressPrivKey)) {
      throw new Error("Not a valid senderAddressPrivKey");
    }
    const prefix = testnet ? ZENCLAIM_MESSAGE_PREFIX_TESTNET : ZENCLAIM_MESSAGE_PREFIX;
    const message = `${prefix}${destinationAddress}`;
    if (!verifySignedMessage(message, zenAddress, signature)) {
      throw new Error("Not a valid signature for signed message");
    }
    const pubKeyCoords = getPubKeyInfo(message, zenAddress, signature, testnet, verbose);
    if (pubKeyCoords.error) {
      throw new Error(pubKeyCoords.error);
    }

    const isTest = options?.isTest
    // Claim ZEN
    const txResult = await submitClaim(zenAddress, destinationAddress, signature, pubKeyCoords, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, testnet, verbose, isTest);
    return txResult;
  } catch (error) {
    return { error: error.message || 'Unable to create the transaction'.red };
  }
}

// Main function for CLI
async function main(args) {
  checkHelp(args, usage);
  
  const options = parseArguments(args);
  listArgs(options);

  try {
    const result = await claimZen(options);

    if (result?.error) {
      console.error(result.error.red);
      process.exit(1);
    }
    if (options.verbose) console.log('no errors');
    console.log(result);
  } catch (error) {
    console.error(error.message.red);
    process.exit(1);
  }
}

// Export the claimZen function for use as a module
export { claimZen };

// If the script is run directly, execute the main function
run(process.argv, 'claimzenaddress.js', main);
