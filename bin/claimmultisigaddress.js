#!/usr/bin/env node

import { isZenAddress, isEthAddress, addressToDecodedHex, checkHelp, listArgs, checkFeeFormat, run, help } from "../src/utils/claimutils.js";
import { decodeMulti, checkRedeemScript, validateSignatures, verifySigsAndGetCoords } from "../src/utils/multisigutils.js";
import { validPrivateKey } from "../src/utils/signutils.js";
import { submitMultisigClaim } from '../src/utils/provider.js'
import { ZENCLAIM_MESSAGE_PREFIX, ZENCLAIM_MESSAGE_PREFIX_TESTNET } from "../src/lib/contractConsts.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'npx zenclaim-claimmultisigaddress  --argument="" --argument="" ... '.cyan}
arguments:
 --zenMultisigAddress="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address) 
 --destinationAddress="0x.." (mandatory, claim destination Ethereum address on Base L2 in EIP-55 mixed-case checksum address encoding)
 --redeemScript="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address redeemScript) 
 --signatures='["",""]' (mandatory, n signatures of a n-of-m multisig address) 
 --senderAddressPrivKey="" (mandatory, private key of Base address sending the transaction and paying the fee. must have enough funds for gas)  
 --maxFeePerGas=int (optional, wei, overrides provider estimate) 
 --maxPriorityFeePerGas=int (optional, wei, overrides provider estimate) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
 --buildmessage  build the message to sign. If present zenMultisigAddress, destinationAddress are required (include testnet if needed). Only the message is returned, no transaction is sent.
${'Short forms of arguments'.cyan} 
  -ma="" -da="" -ra="" -sg="" -pk="" -gf= -pf= -nt="" -h -v -b
${'Claiming ZEN:'.cyan}
The message to sign should consist of the word ${ZENCLAIM_MESSAGE_PREFIX_TESTNET} the base58check decoded representation of the multisig address and the destination Ethereum address on Base L2 in EIP-55 mixed-case checksum address encoding
The addresses must be in the format 0x{hex}.
Example "${ZENCLAIM_MESSAGE_PREFIX_TESTNET}0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x1448283357e8FB6EA763a78836FFD5517149BF70"
Signatures must be created with the public key of each zenAddress used to create the multisig address. 
`;

// Allowed arguments
const long = ['--zenMultisigAddress', '--destinationAddress', '--redeemScript', '--signatures', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose', '--buildmessage'];
const short = ['-ma', '-da', '-rs', '-sg', '-pk', '-gf', '-pf', '-nt', '-s', '-h', '-v', '-b'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
    const options = { isCLI: true }

    for (let i = 0; i < args.length; i++) {
        const [key, val] = args[i].split('=');
        if (allowed.indexOf(key) === -1) {
            console.error(`${key} is not valid. ${help}`.red);
            process.exit(1);
        }
        if (key === '-ma' || key === '--zenMultisigAddress') { options.multisigAddress = val; continue; }
        if (key === '-da' || key === '--destinationAddress') { options.destinationAddress = val; continue; }
        if (key === '-rs' || key === '--redeemScript') { options.redeemScript = val; continue; }
        if (key === '-sg' || key === '--signatures') { options.signatures = args[i].slice(args[i].indexOf('=') + 1); continue; }
        if (key === '-pk' || key === '--senderAddressPrivKey') { options.senderAddressPrivKey = val; continue; }
        if (key === '-gf' || key === '--maxFeePerGas') { options.maxFeePerGas = Number(val); continue; }
        if (key === '-pf' || key === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = Number(val); continue; }
        if (key === '-nt' || key === '--network') { options.network = val; continue; }
        if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
        if (key === '-b' || key === '--buildmessage') { options.buildmessage = true; continue; }
    }
    if (options.buildmessage) {
        if (!options.multisigAddress || !options.destinationAddress) {
            console.error(`zenMultisigAddress and destinationAddress are required. ${help}`.red);
            process.exit(1);
        }
        const message = buildMessage(options);
        console.log(message);
        process.exit(0);
    }

    if (options.verbose) console.log('zenclaim-claimultisigaddress CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

    return options;
}

function buildMessage(options) {
    const testnet = options?.network === 'testnet' ? 1 : 0;
    const prefix = testnet ? ZENCLAIM_MESSAGE_PREFIX_TESTNET : ZENCLAIM_MESSAGE_PREFIX;
    // Validate inputs
    if (!isZenAddress(options.multisigAddress, testnet, true)) {
        throw new Error("Not a valid zen multisig address");
    }
    if (!isEthAddress(options.destinationAddress)) {
        throw new Error(`Not a valid destinationAddress. ${!options.destinationAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
    }
    const message = `${prefix}0x${addressToDecodedHex(options.multisigAddress)}${options.destinationAddress}`;
    return message;
}

// Function to claim ZEN
async function claimMultisig(options) {
    try {
        let { multisigAddress, destinationAddress, redeemScript, signatures, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose } = options;
        if (!options.multisigAddress || !options.destinationAddress || !options.redeemScript || !options.signatures || !options.senderAddressPrivKey) {
            const missing = 'zenMultisigAddress, destinationAddress, redeemScript, signatures, and senderAddressPrivKey are all required.'
            if (options.isCLI)`${missing} ${help}`;
            throw new Error(missing);
        }

        const testnet = network === 'testnet';

        // Standardize senderAddressPrivateKey to not prefix with "0x"
        if (senderAddressPrivKey.startsWith("0x")) {
            senderAddressPrivKey = senderAddressPrivKey.slice(2);
        }

        // Validate inputs
        if (!isZenAddress(multisigAddress, testnet, true, verbose)) {
            throw new Error("Not a valid zen multisig address");
        }
        if (!isEthAddress(destinationAddress)) {
            throw new Error(`Not a valid destinationAddress. ${!destinationAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
        }
        if (!checkRedeemScript(redeemScript, verbose)) {
            throw new Error("Not a valid redeemScript");
        }
        if (!validPrivateKey(senderAddressPrivKey)) {
            throw new Error("Not a valid senderAddressPrivKey");
        }
        const multisig = decodeMulti(redeemScript, testnet, verbose);
        if (multisig.error) {
            throw new Error(multisig.error);
        }
        multisig.redeemScript = redeemScript;

        if (multisigAddress !== multisig.address) {
            throw new Error(`zenMultisigAddress ${multisigAddress} does not match redeemScript address ${multisig.address}`);
        }

        let signaturesArray = JSON.parse(signatures);
        const isSigArrayValid = validateSignatures(signaturesArray, multisig);
        if (isSigArrayValid?.error)
            throw new Error(isSigArrayValid.error);

        const message = buildMessage({ multisigAddress, destinationAddress, network });

        const [orderedPubKeyCoords, orderedSignatures] = verifySigsAndGetCoords(signaturesArray, multisig, message, testnet, verbose);
        let count = orderedPubKeyCoords.filter((a) => Number(a[0]) !== 0).length;
        if (count < multisig.requiredSigs) {
            throw new Error(`Not enough valid signatures found. Required: ${multisig.requiredSigs}, found: ${count}`);
        }
        const mfpg = checkFeeFormat(maxFeePerGas);
        const mpfpg = checkFeeFormat(maxPriorityFeePerGas);

        // Claim ZEN
        const isTest = options?.isTest
        const txResult = await submitMultisigClaim(multisig, destinationAddress, orderedSignatures, orderedPubKeyCoords, senderAddressPrivKey, mfpg, mpfpg, testnet, verbose, isTest);
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
        const result = await claimMultisig(options);
        console.log(result);
    } catch (error) {
        console.error(error.message.red);
        process.exit(1);
    }
}

// Export the claimZen function for use as a module
export { claimMultisig };

// If the script is run directly, execute the main function
run(process.argv, 'claimmultisigaddress', main);
