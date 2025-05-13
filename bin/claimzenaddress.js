#!/usr/bin/env node

import { isZenAddress, isEthAddress, verifySignedMessage, getPubKeyInfo, checkHelp, checkFeeFormat, listArgs, run, help } from "../src/utils/claimutils.js";
import { validPrivateKey } from "../src/utils/signutils.js";
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
    const [key, val] = args[i].split('=');
    if (allowed.indexOf(key) === -1) {
      console.error(`${key} is not valid. ${help}`.red);
      process.exit(1);
    }
    if (key === '-za' || key === '--zenAddress') { options.zenAddress = val; continue; }
    if (key === '-da' || key === '--destinationAddress') { options.destinationAddress = val; continue; }
    if (key === '-sg' || key === '--signature') { options.signature = args[i].slice(args[i].indexOf('=') + 1); continue; }
    if (key === '-pk' || key === '--senderAddressPrivKey') { options.senderAddressPrivKey = val; continue; }
    if (key === '-gf' || key === '--maxFeePerGas') { options.maxFeePerGas = val; continue; }
    if (key === '-pf' || key === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = val; continue; }
    if (key === '-nt' || key === '--network') { options.network = val; continue; }
    if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
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
      if (options.isCLI)`${missing} ${help}`;
      throw new Error(missing);
    }
    const testnet = network === 'testnet'
    // Validate inputs
    if (!isZenAddress(zenAddress, testnet, false, verbose)) {
      throw new Error("Not a valid zenAddress");
    }
    if (!isEthAddress(destinationAddress)) {
      throw new Error("Not a valid destinationAddress");
    }
    if (!validPrivateKey(senderAddressPrivKey)) {
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
    const mfpg = checkFeeFormat(maxFeePerGas);
    const mpfpg = checkFeeFormat(maxPriorityFeePerGas);
    const isTest = options?.isTest

    // Claim ZEN
    const txResult = await submitClaim(zenAddress, destinationAddress, signature, pubKeyCoords, senderAddressPrivKey, mfpg, mpfpg, testnet, verbose, isTest);
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
