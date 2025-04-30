import bs58check from "bs58check";
import eip55 from "eip55";
import { ethers } from "ethers";
import { Keccak } from 'sha3';
import { Buffer } from 'buffer';
import { verify as verifyMsg } from "../../zenclaim-verifymessage/verifyutils.js";
import { getPublicKeyFromSignature, verifyAndRecoverPubKey } from '../../zenclaim-recoverpubkey/recoverutils.js';

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
  isEthAddress,
  isEthPrivKey,
  senderBal,
  verifyMessage,
  getPubKeyInfo,
  decodeZenAddress,
}