import {
  ABI_ZEND_CLAIM,
  FUNCTION_NAME_CLAIM_P2PKH,
  FUNCTION_NAME_CLAIM_P2SH,
  PRECOMPILE_ADDRESS_ZEND_CLAIM, PRECOMPILE_ADDRESS_ZEND_CLAIM_TESTNET
} from "./contractConsts.js";
import { ethers } from "ethers";
import { rpcURLs } from "../../mainconfig.js";
import { decodeZenAddress } from "./claimzenutils.js";

/*
    Using ethers.js v6 to call the claim contract
*/

let provider;
let wallet;
let contractAddress;

const setProvider = async (testnet, verbose) => {
  const endpoint = testnet ? rpcURLs.testnet : rpcURLs.mainnet;
  provider = new ethers.JsonRpcProvider(endpoint);
  if (verbose) {
    console.log("RPC Provider set to: ", endpoint);
    const num = await provider.getBlockNumber();
    console.log("RPC Block number is ", num);
  }
  contractAddress = testnet
    ? PRECOMPILE_ADDRESS_ZEND_CLAIM_TESTNET
    : PRECOMPILE_ADDRESS_ZEND_CLAIM;
};

async function setWallet(privateKey, testnet, verbose) {
  if (!privateKey) {
    console.error("Private key is required to set wallet.");
    return { error: "Private key is required to set wallet." };
  }
  if (verbose) console.log("RPC Setting wallet with private key",);
  try {
    if (!provider) await setProvider(testnet, verbose);
    wallet = new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.error("Error setting wallet: ", error);
    return { error: "Error setting wallet." };
  }
}


//check sender funds to pay gas
async function findSenderBalance(privateKey, testnet, verbose) {
  if (verbose)
    console.log("RPC Checking sender balance by private key");
  try {
    if (!provider) await setProvider(testnet, verbose);
    if (!wallet) setWallet(privateKey, testnet, verbose);
    if (verbose) console.log("RPC checking eth balance for address ", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    return { balance };
  } catch (error) {
    console.error("Error checking sender balance: ", error);
    return { error: "Error checking sender balance." };
  }
}

async function getContractAndSigner(senderAddressPrivKey, testnet, verbose) {
  if (!provider) await setProvider(testnet, verbose);
  if (verbose) console.log("RPC Prepping data for smart contract");

  if (!wallet) await setWallet(senderAddressPrivKey, testnet, verbose);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(contractAddress, ABI_ZEND_CLAIM, provider);
  return { contract, signer }
}

async function checkClaimBalance(zenAddress, testnet, verbose) {
  try {
    const addrDecoded = decodeZenAddress(zenAddress);
    const claim = await getContractAndSigner(addrDecoded.decodedAddr, testnet, verbose);
    const balance = await claim.contract.balances(addrDecoded.decodedAddr);
    if (verbose) console.log("Claim balance: ", ethers.formatEther(balance.toString()));
    return balance;
  } catch (error) {
    console.error("Error checking claim balance: ", error);
    throw new Error("Error checking claim balance.");
  }
}
async function checkFeeData(maxFeePerGas, maxPriorityFeePerGas, verbose) {
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  // add a small buffer to the gas limit
  const gasLimit = gasPrice + ethers.toBigInt('100000');
  const maxFPG = feeData.maxFeePerGas < maxFeePerGas ? feeData.maxFeePerGas : maxFeePerGas;
  const maxPFPG = feeData.maxPriorityFeePerGas < maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas : maxPriorityFeePerGas;
  if (verbose) {
    console.log(`gasPrice:${gasPrice.toString()}, gasLimit:${gasLimit.toString()}`);
    console.log(`Using maxFeePerGas=${maxFPG}, maxPriorityFeePerGas=${maxPFPG}`);
  }
  return [gasPrice, gasLimit, maxFPG, maxPFPG];
}


async function submitClaim(
  zenAddress,
  destAddress,
  signature,
  pubKeyCoords,
  senderAddressPrivKey,
  maxFeePerGas,
  maxPriorityFeePerGas,
  testnet,
  verbose
) {
  try {
    const claim = await getContractAndSigner(senderAddressPrivKey, testnet, verbose);
    const balance = await checkClaimBalance(zenAddress, testnet, verbose);
    if (balance == 0n) {
      return `No balance found in claim address ${zenAddress}`;
    }
    const [gasLimit, maxFPG, maxPFPG] = await checkFeeData(maxFeePerGas, maxPriorityFeePerGas, verbose)

    // build the transaction
    const pubKey = [`0x${pubKeyCoords.pubkeyXcoordinate}`, `0x${pubKeyCoords.pubkeyYcoordinate}`];
    const signatureBuffer = Buffer.from(signature, "base64");

    const tx = await claim.contract[
      FUNCTION_NAME_CLAIM_P2PKH
    ].populateTransaction(destAddress, signatureBuffer, pubKey);

    // get the nonce last
    const nonce = await claim.signer.getNonce();
    if (verbose) console.log("RPC Nonce: ", nonce);

    const txResponse = await claim.signer.sendTransaction({
      to: contractAddress,
      data: tx.data,
      gasLimit,
      nonce,
      maxFPG,
      maxPFPG,
    });
    if (verbose) console.log("RPC tx response: ", JSON.stringify(txResponse));

    // return the transaction hash
    return txResponse.hash;
  } catch (error) {
    console.error("Error processing claim: ", error);
    if (error.revert) console.log(Object.keys(error.revert));
    throw error;
  }
}

async function submitMultisigClaim(
  multisig,
  destAddress,
  orderedSignatures, 
  orderedPubKeyCoords,
  senderAddressPrivKey,
  maxFeePerGas,
  maxPriorityFeePerGas,
  testnet,
  verbose
) {
  try {
    const claim = await getContractAndSigner(senderAddressPrivKey, testnet, verbose);
    const balance = await checkClaimBalance(multisig.address, testnet, verbose);
    if (balance == 0n) {
      return `No balance found in claim address ${multisig.address}`;
    }

    const [gasLimit, maxFPG, maxPFPG] = await checkFeeData(maxFeePerGas, maxPriorityFeePerGas, verbose)

    const rscript = `0x${multisig.redeemScript}`;
    const tx = await claim.contract[
      FUNCTION_NAME_CLAIM_P2SH
    ].populateTransaction(destAddress, orderedSignatures, rscript, orderedPubKeyCoords,);

    // get the nonce last
    const nonce = await claim.signer.getNonce();
    if (verbose) console.log("RPC Nonce: ", nonce);

    const txResponse = await claim.signer.sendTransaction({
      to: contractAddress,
      data: tx.data,
      gasLimit,
      nonce,
      maxFeePerGas: maxFPG,
      maxPriorityFeePerGas: maxPFPG,
    });
    if (verbose) console.log("RPC tx response: ", JSON.stringify(txResponse));

    // return the transaction hash
    return txResponse.hash;
  } catch (error) {
    console.error("Error processing claim: ", error);
    if (error.revert) console.log(Object.keys(error.revert));
    throw error;
  }
}

export { findSenderBalance, submitClaim, submitMultisigClaim };
