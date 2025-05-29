#!/usr/bin/env node

import { isEthAddress, checkHelp, checkFeeFormat, listArgs, run, help } from "../src/utils/claimutils.js";
import { validPrivateKey } from "../src/utils/signutils.js";
import { submitDirectClaim } from '../src/utils/provider.js'
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-claimdirect --baseEthAddress="" --senderAddressPrivKey="" ... '.cyan}
arguments:
 --baseEthAddress="" (mandatory, Ethereum address on Base)
 --senderAddressPrivKey="" (mandatory, private key of Horizen 2 address sending the transaction and paying the fee)
 --maxFeePerGas=int (optional, wei) 
 --maxPriorityFeePerGas=int (optional, wei) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
${'Short forms of arguments'.cyan} 
  -a="" -pk="" -gf= -pf= -nt="" -h -v
${'Claiming ZEN:'.cyan}
`;

// Allowed arguments
const long = ['--baseEthAddress', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose'];
const short = ['-a', '-pk', '-gf', '-pf', '-nt', '-h', '-v'];
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
    if (key === '-a' || key === '--baseEthAddress') { options.baseEthAddress = val; continue; }
    if (key === '-pk' || key === '--senderAddressPrivKey') { options.senderAddressPrivKey = val; continue; }
    if (key === '-gf' || key === '--maxFeePerGas') { options.maxFeePerGas = val; continue; }
    if (key === '-pf' || key === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = val; continue; }
    if (key === '-nt' || key === '--network') { options.network = val; continue; }
    if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-claimdirect CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  return options;
}

// Function to claim ZEN
async function claimDirect(options) {
  try {
    let { baseEthAddress, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose } = options;
    if (!baseEthAddress || !senderAddressPrivKey) {
      const missing = 'baseEthAddress and senderAddressPrivKey are required.';
      if (options.isCLI) `${missing} ${help}`;
      throw new Error(missing);
    }

    const testnet = network === 'testnet';

    // Standardize senderAddressPrivateKey to not prefix with "0x"
    if (senderAddressPrivKey.startsWith("0x")) {
      senderAddressPrivKey = senderAddressPrivKey.slice(2);
    }

    // Validate inputs
    if (!isEthAddress(baseEthAddress)) {
      throw new Error("Not a valid ETH address");
    }

    if (!validPrivateKey(senderAddressPrivKey)) {
      throw new Error("Not a valid senderAddressPrivKey");
    }

    const mfpg = checkFeeFormat(maxFeePerGas);
    const mpfpg = checkFeeFormat(maxPriorityFeePerGas);
    const isTest = options?.isTest

    // Claim ZEN
    const txResult = await submitDirectClaim(baseEthAddress, senderAddressPrivKey, mfpg, mpfpg, testnet, verbose, isTest);
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
    const result = await claimDirect(options);

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

// Export the claimDirect function for use as a module
export { claimDirect };

// If the script is run directly, execute the main function
run(process.argv, 'claimdirect', main);
