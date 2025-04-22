// import zencashjs from "zencashjs"
import bs58check from "bs58check";
// import { writeZenClaimContract } from './zenClaim/useZenClaimContract'

import { Keccak  } from 'sha3';
import { Buffer } from 'buffer';
import { checkClaimAddressBalance, sendDataToSmartContract } from './zenClaim/rpc.js'

const regexZenAddr = /^[z][a-km-zA-HJ-NP-Z1-9]{26,36}$/;
const regexEth = /^0x[a-fA-F0-9]{40}$/;
const regexEthPrivKey = /(^|\b)(0x)?[0-9a-fA-F]{64}(\b|$)/

/**
 *
 * @param {string} addr  zen address
 * @returns boolean
 */
const isZen = (addr) => {
  return regexZenAddr.test(addr);
};

/**
 *
 * @param {string} addr
 * @param {number} testnet 0 or 1
 * @returns boolean
 */
const isZenAddress = (address, testnet, verbose) => {
  if (verbose) console.log("ZEN isZenAddress check", address);
  if (!isZen(address)) return false;

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
  if (verbose) console.log("ZEN zenAddress ok");
  return true;
};

/**
*
* @param {string} addr  EON/H2 (eth) address. expects 0x prefix
* @returns boolean
*/
const isH2Address = (destinationAddress) => {
  return regexEth.test(destinationAddress);
}
/**
*
* @param {string} addr  EON/H2 (eth) private key
* @returns boolean
*/
const isH2PrivKey = (senderAddressPrivKey) => {
  return regexEthPrivKey.test(senderAddressPrivKey);
}


// const zendAddrToLowercaseHorizen2Addr = (mc_address) => {
//   // Step 1: compute Keccak-256 hash of the address
//   // const hash = keccak256(mc_address);
//   const hash = new Keccak(256);
//   hash.update(mc_address);

//   // Convert the hash to a Buffer
//   // const hashBuffer = Buffer.from(hash, 'hex');
//   const hashBuffer = hash.digest('hex');

//   // Step 2: take the last 20 bytes
//   const trimmedResult = hashBuffer.slice(-20);

//   // Convert the trimmed result to a hex string
//   const addr = trimmedResult.toString('hex');

//   // Return the formatted address
//   return `0x${addr}`;
// }


const zendAddrToLowercaseHorizen2Addr = (mc_address) => {
  // Step 1: compute Keccak-256 hash of the address
  const hasher = new Keccak(256);
  hasher.update(mc_address);
  const result = hasher.digest();

  // Step 2: take the last 20 bytes
  const trimmedResult = result.slice(-20);

  // Convert the trimmed result to a hex string
  const addr = Buffer.from(trimmedResult).toString('hex');

  // Return the formatted address
  return `0x${addr}`;
}
const checkClaimAddress = async (mc_address, network, verbose) => {
  const eth_address = zendAddrToLowercaseHorizen2Addr(mc_address);
  if (!isH2Address(eth_address)) {
    console.error("Not a valid H2 address.");
    // process.exit();
    return { error: "Error deriving the Horizen 2 claim address from the Zen address provided." }
  }

  const balance = await checkClaimAddressBalance(eth_address, network, verbose);
  if (!balance || Number(balance) === 0) {
    console.error("No balance in Horizen 2 claim address");
    // process.exit();
    return { error: `No balance found in Horizen 2 claim address ${eth_address} for zen main chain address ${mc_address}` }
  }

  return { eth_address, balance };
}

const claimZen = (zenAddress, destinationAddress, signature, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose) => {
  return sendDataToSmartContract(zenAddress, destinationAddress, signature, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, network, verbose)
}


// validate


// // Construct
// const wsProvider = new WsProvider('wss://rpc.polkadot.io');
// const api = await ApiPromise.create({ provider: wsProvider });

// // Do something
// console.log(api.genesisHash.toHex());

//validate any amounts

//select testnet

// const result = await writeZenClaimContract(zenAddress, destinationAddress, signature)
// const zend_address = "ztTmj8oJzBo2s8fcewUA3GexNUeWA24Qe8T";
// const zend_address = "ztWAzdzHEJ5dGgyy6McEqQiDcHz1tGpRiYk";
// const network = 1
// checkClaimAddress(zend_address, network)


export {
  isZenAddress,
  isH2Address,
  isH2PrivKey,
  checkClaimAddress,
  claimZen
}