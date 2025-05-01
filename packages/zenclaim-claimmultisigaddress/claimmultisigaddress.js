#!/usr/bin/env node

import * as zen from "../zenclaim-claimzenaddress/zenClaim/claimzenutils.js";
import * as ms from "./multisigutils.js";
import { findSenderBalance, submitMultisigClaim } from '../zenclaim-claimzenaddress/zenClaim/rpc.js'
import { ZENCLAIM_MESSAGE_PREFIX, ZENCLAIM_MESSAGE_PREFIX_TESTNET } from "../zenclaim-claimzenaddress/zenClaim/contractConsts.js";
import 'colors';


// HELP
const usage = `${'npx zenclaim-claimmultisigaddress  --argument="" --argument="" ... '.cyan}
arguments:
 --zenMultisigAddress="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address) 
 --destinationAddress="0x.." (mandatory, claim destination Ethereum address on Base L2) 
 --redeemScript="" (mandatory, Horizen 1 Mainchain P2SH-Multisig address redeemScript) 
 --signatures='["",""]' (mandatory, n signatures of a n-of-m multisig address) 
 --senderAddressPrivKey="0x.." (mandatory, private key of Base address sending the transaction and paying the fee. must have enough funds for gas)  
 --maxFeePerGas=int (optional, wei, default 20000000000) 
 --maxPriorityFeePerGas=int (optional, wei, default 20000000000) 
 --network="mainnet||testnet" (optional, default "mainnet")
 --help  display this help
 --verbose  display additional values to help check for errors
 --buildmessage  build the message to sign. If present zenMultisigAddress, destinationAddress are required (include testnet if needed). Only the message is returned, no transaction is sent.
${'Short forms of arguments'.cyan} 
  -ma="" -da="" -ra="" -sg="" -pk="" -gf= -pf= -nt="" -h -v -b
${'Claiming ZEN:'.cyan}
The message to sign should consist of the word ZENCLAIM the base58checked decode of the multisig address and the destination Ethereum address on Base L2 
The addresses must be in the format 0x{hex}.
Example "ZENCLAIM0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x1448283357e8FB6EA763a78836FFD5517149BF70"
Signatures must be created with the public key of each zenAddress the multisig address is composed of. 
`;

// Allowed arguments
const long = ['--zenMultisigAddress', '--destinationAddress', '--redeemscript', '--signatures', '--senderAddressPrivKey', '--maxFeePerGas', '--maxPriorityFeePerGas', '--network', '--help', '--verbose', '--buildmessage'];
const short = ['-ma', '-da', '-rs', '-sg', '-pk', '-gf', '-pf', '-nt', '-s', '-h', '-v', '-b'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
    let options = {
        multisigAddress: null,
        destinationAddress: null,
        redeemScript: null,
        signatures: null,
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
        if (val[0] === '-ma' || val[0] === '--zenMultisigAddress') { options.multisigAddress = val[1]; continue; }
        if (val[0] === '-da' || val[0] === '--destinationAddress') { options.destinationAddress = val[1]; continue; }
        if (val[0] === '-rs' || val[0] === '--redeemScript') { options.redeemScript = val[1]; continue; }
        if (val[0] === '-sg' || val[0] === '--signatures') { options.signatures = args[i].slice(args[i].indexOf('=') + 1); continue; }
        if (val[0] === '-pk' || val[0] === '--senderAddressPrivKey') { options.senderAddressPrivKey = val[1]; continue; }
        if (val[0] === '-gf' || val[0] === '--maxFeePerGas') { options.maxFeePerGas = Number(val[1]); continue; }
        if (val[0] === '-pf' || val[0] === '--maxPriorityFeePerGas') { options.maxPriorityFeePerGas = Number(val[1]); continue; }
        if (val[0] === '-nt' || val[0] === '--network') { options.network = val[1]; continue; }
        if (val[0] === '-v' || val[0] === '--verbose') { options.verbose = true; continue; }
        if (val[0] === '-b' || val[0] === '--buildmessage') { options.buildmessage = true; continue; }
    }
    if (options.buildmessage) {
        if (!options.multisigAddress || !options.destinationAddress) {
            console.error('zenMultisigAddress and destinationAddress are required. For help: use --help or -h'.red);
            process.exit(1);
        }
        const message = buildMessage(options);
        console.log(message);
        process.exit(0);
    }


    if (!options.multisigAddress || !options.destinationAddress || !options.redeemScript || !options.signatures || !options.senderAddressPrivKey) {
        console.error('zenMultisigAddress, destinationAddress, redeemScript, signatures, and senderAddressPrivKey are all required. For help: use --help or -h'.red);
        process.exit(1);
    }

    return options;
}

function buildMessage(options) {
    const prefix = options.network === 'testnet' ? ZENCLAIM_MESSAGE_PREFIX_TESTNET : ZENCLAIM_MESSAGE_PREFIX;
    const message = `${prefix}0x${ms.decodeZenAddress(options.multisigAddress).toString('hex')}${options.destinationAddress}`;
    return message;
}

// Function to claim ZEN
async function claimMultisig(options) {
    const { multisigAddress, destinationAddress, redeemScript, signatures, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose } = options;
    const testnet = network === 'testnet' ? 1 : 0;
    try {
        // Validate inputs
        if (!zen.isZenAddress(multisigAddress, testnet, true, verbose)) {
            throw new Error("Not a valid zen multisig address");
        }
        if (!zen.isEthAddress(destinationAddress)) {
            throw new Error(`Not a valid destinationAddress. ${!destinationAddress.startsWith('0x') ? 'Missing 0x prefix' : ''}`);
        }
        if (!ms.checkRedeemScript(redeemScript)) {
            throw new Error("Not a valid redeemScript");
        }
        if (!zen.isEthPrivKey(senderAddressPrivKey)) {
            throw new Error("Not a valid senderAddressPrivKey");
        }
        const multisig = ms.decodeMulti(redeemScript, testnet, verbose);
        if (multisig.error) {
            throw new Error(multisig.error);
        }
        multisig.redeemScript = redeemScript;

        if (multisigAddress !== multisig.address) {
            throw new Error(`zenMultisigAddress ${multisigAddress} does not match redeemScript address ${multisig.address}`);
        }

        let signaturesArray = JSON.parse(signatures);
        const isSigArrayValid = ms.validateSignatures(signaturesArray, multisig);
        if (isSigArrayValid?.error)
            throw new Error(isSigArrayValid.error);

        const message = buildMessage({ multisigAddress, destinationAddress, network });

        const [orderedPubKeyCoords, orderedSignatures] = ms.verifySigsAndGetCoords(signaturesArray, multisig, message, testnet, verbose);
        let count = orderedPubKeyCoords.filter((a) => Number(a[0]) !== 0).length;
        if (count < multisig.requiredSigs) {
            throw new Error(`Not enough valid signatures found. Required: ${multisig.requiredSigs}, found: ${count}`);
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
        const txResult = await submitMultisigClaim(multisig, destinationAddress, orderedSignatures, orderedPubKeyCoords, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, testnet, verbose);
        return txResult;
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
const argv = process.argv;
const isCLI = argv[0].includes('node') && argv[1].endsWith('claimmultisigaddress.js');
if (isCLI) {
    main(argv.slice(2));
}