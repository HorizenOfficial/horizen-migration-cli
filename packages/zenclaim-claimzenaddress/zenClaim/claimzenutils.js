import bs58check from "bs58check";
import eip55 from "eip55";

import { Keccak } from 'sha3';
import { Buffer } from 'buffer';
import { verify as verifyMsg } from "../../zenclaim-verifymessage/verifyutils.js";
import { getPublicKeyFromSignature, verifyAndRecoverPubKey } from '../../zenclaim-recoverpubkey/recoverutils.js';

const regexEthPrivKey = /(^|\b)(0x)?[0-9a-fA-F]{64}(\b|$)/

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
    prefix = Buffer.from(bs58check.decode(address)).toString("hex").slice(0, 4);
  } catch (err) {
    if (verbose) console.log(err.message);
    return false;
  }

  if (!testnet && prefix !== "2089" && prefix !== "2096") {
    if (verbose) console.log("ZEN isZenAddress rejecting non mainnet address");
    return false;
  }
  if (testnet && prefix !== "2098" && prefix !== "2092") {
    if (verbose) console.log("ZEN isZenAddress rejecting non testnet address");
    return false;
  }
  if (isMulti && prefix !== "2096" && prefix !== "2092") {
    if (verbose) console.log("ZEN isZenAddress rejecting non multisig address");
    return false;
  }
  if (!isMulti && prefix == "2096" && prefix == "2092") {
    if (verbose) console.log("ZEN isZenAddress rejecting multisig address");
    return false;
  }

  if (verbose) console.log("ZEN zenAddress ok");
  return true;
};

/**
*
* @param {string} addr  EON/H2 (eth) address. expects 0x prefix
* @returns boolean
*/
const isH2Address = (destinationAddress) => {
  //this can throw an error if the address is not valid.
  return eip55.verify(destinationAddress, false);
}
/**
*
* @param {string} addr  EON/H2 (eth) private key
* @returns boolean
*/
const isH2PrivKey = (senderAddressPrivKey) => {
  return regexEthPrivKey.test(senderAddressPrivKey);
}

const zendAddrToLowercaseHorizen2Addr = (mc_address) => {
  // Step 1: compute Keccak-256 hash of the address
  const hasher = new Keccak(256);
  hasher.update(mc_address);
  const result = hasher.digest();

  // Step 2: take the last 20 bytes
  const trimmedResult = result.subarray(-20);
   

  // Convert the trimmed result to a hex string
  const addr = Buffer.from(trimmedResult).toString('hex');

  // Return the formatted address
  return `0x${addr}`;
}

const checkClaimAddress = async (mc_address, network, verbose) => {
  const eth_address = zendAddrToLowercaseHorizen2Addr(mc_address);
  let checksummedAddress;
  try {
    checksummedAddress = eip55.encode(eth_address);
    if (!isH2Address(checksummedAddress)) {
      if (verbose) console.error("Not a valid H2 address.");
      return { error: "Not a valid H2 adress." }
    }
    return { claimAddress: checksummedAddress };
  } catch (error) {
    if (verbose) console.error("Error deriving the Horizen 2 claim address from the Zen address provided.");
    return { error: "Error deriving the Horizen 2 claim address from the Zen address provided." }
  }
}

// check sender address balance for funds to pay gas
const senderBal = async (senderPrivateKey) => {
  const bal = await findSenderBalance(senderPrivateKey);
  return bal

}
const verifyMessage = (message, zenAddress, signature) => {
  return verifyMsg(message, zenAddress, signature)
}

const getPubKeyInfo = (message, zenAddress, signature, network, verbose) => {
  const sigPubKey = getPublicKeyFromSignature (message, signature)
  const result = verifyAndRecoverPubKey(zenAddress, sigPubKey, network, verbose);
  return result;
}

const decodeZenAddress = (zenAddress) => {
  const decodedFull = bs58check.decode(zenAddress);
  const decodedAddr = decodedFull.slice(2)
  return { decodedFull, decodedAddr };
}

export {
  isZenAddress,
  isH2Address,
  isH2PrivKey,
  checkClaimAddress,
  senderBal,
  verifyMessage,
  getPubKeyInfo,
  decodeZenAddress,
}