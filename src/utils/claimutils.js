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
const isZenAddress = (address, testnet, isMulti = false, verbose) => {
  if (verbose) console.log("ZEN isZenAddress check", address);

  let prefix;
  try {
    prefix = Number(Buffer.from(bs58check.decode(address)).toString("hex").slice(0, 4));
  } catch (err) {
    if (verbose) console.log(err.message);
    return false;
  }
  const main = bip32Network['mainnet'];
  const test = bip32Network['testnet'];
  if (!testnet && prefix !== main.pubKeyHash && prefix !==main.scriptHash) {
    if (verbose) console.log("ZEN isZenAddress rejecting non mainnet address");
    return false;
  }
  if (testnet && prefix !== test.pubKeyHash && prefix !== test.scriptHash) {
    if (verbose) console.log("ZEN isZenAddress rejecting non testnet address");
    return false;
  } 
  if (isMulti && prefix !== main.scriptHash && prefix !==test.scriptHash) {
    if (verbose) console.log("ZEN isZenAddress rejecting non multisig address");
    return false;
  }
  if (!isMulti && (prefix === main.scriptHash || prefix === test.scriptHash)) {
    if (verbose) console.log("ZEN isZenAddress rejecting multisig address");
    return false;
  }

  if (verbose) console.log("ZEN zenAddress ok");
  return true;
};

const checkPrivKeyWif = (privKey, testnet, verbose) => {
  try {
    const prefix = Buffer.from(bs58check.decode(privKey)).toString("hex").slice(0, 2);
    return Number("0x" +prefix) == bip32Network[testnet ? "testnet" : "mainnet"].wif;
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
/**
*
* @param {string} value  (eth) private key
* @returns boolean
*/
const isEthPrivKey = (value) => {
  if (ethers.isHexString(value)) {
    return true;
  } else {
    if (value.length === 64) {
      return ethers.isHexString(`0x${value}`);
    }
    return false;
  }

}


const verifySignedMessage = (message, zAddr, signature) => {
  const verification = zencashjs.message.verify(message, zAddr, signature);
  return verification;
}

const getPubKeyInfo = (message, zenAddress, signature, network, verbose) => {
  const sigPubKey = getPublicKeyFromSignature (message, signature)
  const result = verifyAndRecoverPubKey(zenAddress, sigPubKey, network, verbose);
  return result;
}

function decodeZenAddress(address) {
  // prefix is 2 bytes in zencash instead of 1
  const decoded = bs58check.decode(address).subarray(2)
  if (decoded.length !== 20) throw new Error('Invalid address length')
  return decoded
}
function addressToDecodedHex (address) {
  const decoded = decodeZenAddress(address);
  return Buffer.from(decoded).toString("hex");
}
export {
  isZenAddress,
  isEthAddress,
  isEthPrivKey,
  verifySignedMessage,
  getPubKeyInfo,
  decodeZenAddress,
  addressToDecodedHex,
  checkPrivKeyWif
}