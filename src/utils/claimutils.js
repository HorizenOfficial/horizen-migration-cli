import bs58check from "bs58check";
import eip55 from "eip55";
import { ethers } from "ethers";
import { Buffer } from 'buffer';
import { getPublicKeyFromSignature, verifyAndRecoverPubKey } from './recoverutils.js';
import { bip32Network } from "./phraseutils.js";
import zencashjs from "zencashjs";

/**
 *
 * @param {string} addr
 * @param {number} testnet 0 or 1
 * @returns boolean
 */
const isZenAddress = (address, isTestnet, isMultiSig = false, verbose) => {
  if (verbose) console.log("checking zen address:", address);

  let prefix;
  try {
    prefix = Number(Buffer.from(bs58check.decode(address)).toString("hex").slice(0, 4));
  } catch (err) {
    if (verbose) console.log(err.message);
    return false;
  }
  const mainnet = bip32Network['mainnet'];
  const testnet = bip32Network['testnet'];

  if (isTestnet && isMultiSig && prefix !== testnet.scriptHash) {
    if (verbose) console.log(`${address} is not a valid testnet multisig address`);
    return false;
  }
  if (!isTestnet && isMultiSig && prefix !== mainnet.scriptHash) {
    if (verbose) console.log(`${address} is not a valid mainnet multisig address`);
    return false;
  }
  if (isTestnet && !isMultiSig && prefix !== testnet.pubKeyHash) {
    if (verbose) console.log(`${address} is not a valid testnet address`);
    return false;
  }
  if (!isTestnet && !isMultiSig && prefix !== mainnet.pubKeyHash) {
    if (verbose) console.log(`${address} is not a valid mainnet address`);
    return false;
  }

  if (verbose) console.log("zen address ok");
  return true;
};

const checkPrivKeyWif = (privKey, testnet, verbose) => {
  try {
    const prefix = Buffer.from(bs58check.decode(privKey)).toString("hex").slice(0, 2);
    return Number("0x" + prefix) == bip32Network[testnet ? "testnet" : "mainnet"].wif;
  } catch (err) {
    if (verbose) console.log(err.message);
    return false;
  }
}


/**
 *
 * @param {string} destinationAddress (eth) address. expects 0x prefix
 * @returns boolean
*/
const isEthAddress = (destinationAddress) => {
  //this can throw an error if the address is not valid.
  return eip55.verify(destinationAddress, false);
}

const verifySignedMessage = (message, zAddr, signature) => {
  const verification = zencashjs.message.verify(message, zAddr, signature);
  return verification;
}

const getPubKeyInfo = (message, zenAddress, signature, testnet, verbose) => {
  const sigPubKey = getPublicKeyFromSignature(message, signature)
  const result = verifyAndRecoverPubKey(zenAddress, sigPubKey, testnet, verbose);
  return result;
}

function decodeZenAddress(address) {
  // prefix is 2 bytes in zencash instead of 1
  const decoded = bs58check.decode(address).subarray(2)
  if (decoded.length !== 20) throw new Error('Invalid address length')
  return decoded
}
function addressToDecodedHex(address) {
  const decoded = decodeZenAddress(address);
  return Buffer.from(decoded).toString("hex");
}

/**
 *
 * @param {string} pubKey  public key
 * @param {string or number} tnet  0 or 1
 * @returns the zen address of the public key
 */

function publicKeyToAddr(pubKey, tnet) {
    const testnet = Number(tnet) || 0;
    return zencashjs.address.pubKeyToAddr(
        pubKey,
        testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash,
    );
}

function ethAddressToHexString(ethereumAddress) {
  let validEthAddress;
  try {
    validEthAddress = ethers.getAddress(ethereumAddress);
  } catch (error) {
    console.error(
      "Error: ethAddressToHexString() invalid Etherum Address passed.",
    );
    process.exit(1);
  }
  return validEthAddress.slice(2);
}

function checkHelp(args, usage) {
  const call = args.includes('--help') || args.includes('-h');
  if (call || args.length === 0) {
    console.log(usage);
    process.exit(0);
  }
}
function listArgs(options) {
  if (options.verbose) {
    console.log('Arguments received:'.cyan, options);
  }
}
function run(argv, file, main) {
  const isCLI = argv[0].includes('node') && argv[1].endsWith(file);
  if (isCLI) {
      main(argv.slice(2));
  }
}

function checkFeeFormat(fee){
  if(!fee) return undefined;
  if (typeof fee === 'string' && fee.slice(-1)=== 'n') return Number(fee.slice(0, -1));
  if (typeof fee === BigInt || !isNaN(Number(fee))) return Number(fee);
  
  return undefined;
}

const help = 'For help: use --help or -h';

const securityConsideration = `
Security Considerations:
  - Disable shell history before using this tool (e.g., run \`set +o history\` in bash).
  - Avoid running in multi-user environments, as secrets passed via command-line arguments may be exposed to other users via the process list.
`;

export {
  isZenAddress,
  isEthAddress,
  verifySignedMessage,
  getPubKeyInfo,
  decodeZenAddress,
  addressToDecodedHex,
  checkPrivKeyWif,
  publicKeyToAddr,
  ethAddressToHexString,
  checkHelp,
  listArgs,
  run,
  help,
  checkFeeFormat,
  securityConsideration
}