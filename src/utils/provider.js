import {
  ABI_ZEND_CLAIM,
  FUNCTION_NAME_CLAIM_DIRECT,
  FUNCTION_NAME_CLAIM_DIRECT_MULTISIG,
  FUNCTION_NAME_CLAIM_P2PKH,
  FUNCTION_NAME_CLAIM_P2SH,
  ZEND_BACKUP_VAULT_CONTRACT_ADDRESS, ZEND_BACKUP_VAULT_CONTRACT_ADDRESS_TESTNET
} from "../lib/contractConsts.js";
import { ethers } from "ethers";
import { rpcURLs } from "../../mainconfig.js";
import { decodeZenAddress } from "./claimutils.js";
import { deriveClaimDirectAddress } from "../../bin/deriveclaimdirectaddress.js";

/*
    Using ethers.js v6 for provider and claim contract
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
    ? ZEND_BACKUP_VAULT_CONTRACT_ADDRESS_TESTNET
    : ZEND_BACKUP_VAULT_CONTRACT_ADDRESS;
};

async function setWallet(privateKey, testnet, verbose) {
  if (!privateKey) {
    return { error: "Private key is required to set wallet." };
  }
  if (verbose) console.log("RPC Setting wallet with private key",);
  try {
    if (!provider) await setProvider(testnet, verbose);
    wallet = await new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.error("Error setting wallet: ", error.message);
    return { error: "Error setting wallet." };
  }
}


//check sender funds to pay gas
async function findSenderBalance(privateKey, testnet, verbose) {
  try {
    const balance = await provider.getBalance(wallet.address);
    if (verbose) console.log(`Senders eth balance ${ethers.formatEther(balance)}`);
    return balance;
  } catch (error) {
    console.error("Error checking sender balance: ", error);
    return { error: "Error checking sender balance." };
  }
}

async function getContractAndSigner(senderAddressPrivKey, testnet, verbose) {
  if (verbose) console.log("RPC Prepping data for smart contract");
  await setProvider(testnet, verbose);
  await setWallet(senderAddressPrivKey, testnet, verbose);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(contractAddress, ABI_ZEND_CLAIM, provider);
  return { contract, signer }
}

async function checkClaimBalance(zenAddress, contract, verbose) {
  try {
    const addrDecoded = decodeZenAddress(zenAddress);
    const balance = await contract.balances(addrDecoded);
    if (verbose) console.log("Claim balance: ", ethers.formatEther(balance.toString()));
    return balance;
  } catch (error) {
    console.log("Error checking claim balance: ", error?.info?.error || error?.shortMessage || error);
    throw new Error("Error checking claim balance.");
  }
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
  verbose,
  isTest,
) {
  try {
    // check balances
    const claim = await getContractAndSigner(senderAddressPrivKey, testnet, verbose);
    const claimBalance = await checkClaimBalance(zenAddress, claim.contract, verbose);
    if (claimBalance == 0n) {
      return `No balance found in claim address ${zenAddress}`;
    }
    const senderBalance = await findSenderBalance(senderAddressPrivKey, testnet, verbose);
    if (senderBalance === 0n) {
      throw new Error(`No balance in sender address to pay gas.`);
    }

    // prep the transaction data
    const pubKey = [`0x${pubKeyCoords.pubkeyXcoordinate}`, `0x${pubKeyCoords.pubkeyYcoordinate}`];
    const signatureBuffer = Buffer.from(signature, "base64");

    // check fees
    const feeData = await provider.getFeeData();
    const maxFPG = maxFeePerGas ? ethers.toBigInt(maxFeePerGas) : feeData.maxFeePerGas;
    const maxPFPG = maxPriorityFeePerGas || maxPriorityFeePerGas === 0 ? ethers.toBigInt(maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const gasEstimate = await claim.contract[FUNCTION_NAME_CLAIM_P2PKH].estimateGas(destAddress, signatureBuffer, pubKey)
    const maxGasCost = gasEstimate * (maxFPG + maxPFPG);
    if (senderBalance < maxGasCost) {
      throw new Error(`Insufficient sender balance. Need up to ${ethers.formatEther(maxGasCost)} Found ${ethers.formatEther(senderBalance)}`)
    }
    if (verbose) console.log('Max eth transaction fee', ethers.formatEther(maxGasCost))

    const tx = await claim.contract[
      FUNCTION_NAME_CLAIM_P2PKH
    ].populateTransaction(destAddress, signatureBuffer, pubKey);

    // get the nonce last
    const nonce = await claim.signer.getNonce();
    if (verbose) console.log("RPC Nonce: ", nonce);

    // don't send if test
    if (isTest) return "Test completed"

    const txResponse = await claim.signer.sendTransaction({
      to: contractAddress,
      data: tx.data,
      nonce,
      maxFPG,
      maxPFPG,
    });
    if (verbose) console.log("RPC tx response: ", JSON.stringify(txResponse));

    // return the transaction hash
    return txResponse.hash;
  } catch (error) {
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
  verbose,
  isTest,
) {
  try {
    //check balances
    const claim = await getContractAndSigner(senderAddressPrivKey, testnet, verbose);
    const claimBalance = await checkClaimBalance(multisig.address, claim.contract, verbose);
    if (claimBalance == 0n) {
      return `No balance found in claim address ${multisig.address}`;
    }
    const senderBalance = await findSenderBalance(senderAddressPrivKey, testnet, verbose);
    if (senderBalance === 0n) {
      throw new Error(`No balance in sender address to pay gas.`);
    }

    // prep the transaction data
    const pubKey = [`0x${pubKeyCoords.pubkeyXcoordinate}`, `0x${pubKeyCoords.pubkeyYcoordinate}`];
    const signatureBuffer = Buffer.from(signature, "base64");

    // check fees
    const feeData = await provider.getFeeData();
    const maxFPG = maxFeePerGas ? ethers.toBigInt(maxFeePerGas) : feeData.maxFeePerGas;
    const maxPFPG = maxPriorityFeePerGas || maxPriorityFeePerGas === 0 ? ethers.toBigInt(maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const gasEstimate = await claim.contract[FUNCTION_NAME_CLAIM_P2PKH].estimateGas(destAddress, signatureBuffer, pubKey)
    const maxGasCost = gasEstimate * (maxFPG + maxPFPG);
    // check if sender balance is sufficient
    if (senderBalance < maxGasCost) {
      throw new Error(`Insufficient sender balance. Need up to ${ethers.formatEther(maxGasCost)} Found ${ethers.formatEther(senderBalance)}`)
    }
    if (verbose) console.log('Max eth transaction fee', ethers.formatEther(maxGasCost))

    const tx = await claim.contract[
      FUNCTION_NAME_CLAIM_P2SH
    ].populateTransaction(destAddress, orderedSignatures, rscript, orderedPubKeyCoords,);

    // get the nonce last
    const nonce = await claim.signer.getNonce();
    if (verbose) console.log("RPC Nonce: ", nonce);

    // don't send if test
    if (isTest) return "Test completed"

    const txResponse = await claim.signer.sendTransaction({
      to: contractAddress,
      data: tx.data,
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

async function submitDirectClaim(
  baseEthAddress,
  senderAddressPrivKey,
  maxFeePerGas,
  maxPriorityFeePerGas,
  testnet,
  verbose,
  isTest,
) {
  try {
    // check claimable balance and sending addr balance
    const claim = await getContractAndSigner(senderAddressPrivKey, testnet, verbose);
    const zenAddress = deriveClaimDirectAddress({ baseEthAddress, network: testnet ? 'testnet': 'mainnet'});
    const claimBalance = await checkClaimBalance(zenAddress, claim.contract, verbose);
    if (claimBalance == 0n) {
      return `No balance found in claim address ${zenAddress}`;
    }
  
    const senderBalance = await findSenderBalance(senderAddressPrivKey, testnet, verbose);
    if (senderBalance === 0n) {
      throw new Error(`No balance in sender address to pay gas.`);
    }

    // check fees
    const feeData = await provider.getFeeData();
    const maxFPG = maxFeePerGas ? ethers.toBigInt(maxFeePerGas) : feeData.maxFeePerGas;

    const maxPFPG = maxPriorityFeePerGas || maxPriorityFeePerGas === 0 ? ethers.toBigInt(maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;

    const gasEstimate = await claim.contract[FUNCTION_NAME_CLAIM_DIRECT].estimateGas(baseEthAddress)
    const maxGasCost = gasEstimate * (maxFPG + maxPFPG);
    if (senderBalance < maxGasCost) {
      throw new Error(`Insufficient sender balance. Need up to ${ethers.formatEther(maxGasCost)} Found ${ethers.formatEther(senderBalance)}`)
    }
    if (verbose) console.log('Max eth transaction fee', ethers.formatEther(maxGasCost))

    const tx = await claim.contract[
      FUNCTION_NAME_CLAIM_DIRECT
    ].populateTransaction(baseEthAddress);

    // get the nonce last
    const nonce = await claim.signer.getNonce();
    if (verbose) console.log("RPC Nonce: ", nonce);

    // don't send if test
    if (isTest) return "Test completed"

    const txResponse = await claim.signer.sendTransaction({
      to: contractAddress,
      data: tx.data,
      nonce,
      maxFPG,
      maxPFPG,
    });
    if (verbose) console.log("RPC tx response: ", JSON.stringify(txResponse));

    // return the transaction hash
    return txResponse.hash;
  } catch (error) {
    if (error.revert) console.log(Object.keys(error.revert));
    throw error;
  }
}

async function submitDirectClaimMultisig(
  redeemScript,
  baseEthAddress,
  senderAddressPrivKey,
  maxFeePerGas,
  maxPriorityFeePerGas,
  testnet,
  verbose,
  isTest,
) {
  try {
    // check balances
    const claim = await getContractAndSigner(senderAddressPrivKey, testnet, verbose);
    const zenAddress = deriveClaimDirectAddress({ baseEthAddress, network: testnet ? 'testnet': 'mainnet'});
    const claimBalance = await checkClaimBalance(zenAddress, claim.contract, verbose);
    if (claimBalance == 0n) {
      return `No balance found in claim address ${zenAddress}`;
    }

    const senderBalance = await findSenderBalance(senderAddressPrivKey, testnet, verbose);
    if (senderBalance === 0n) {
      throw new Error(`No balance in sender address to pay gas.`);
    }
    console.log('redeem script', redeemScript);


    // check fees
    const feeData = await provider.getFeeData();
    const maxFPG = maxFeePerGas ? ethers.toBigInt(maxFeePerGas) : feeData.maxFeePerGas;
    const maxPFPG = maxPriorityFeePerGas || maxPriorityFeePerGas === 0 ? ethers.toBigInt(maxPriorityFeePerGas) : feeData.maxPriorityFeePerGas;
    const gasEstimate = await claim.contract[FUNCTION_NAME_CLAIM_DIRECT_MULTISIG].estimateGas(redeemScript, baseEthAddress)
    const maxGasCost = gasEstimate * (maxFPG + maxPFPG);
    if (senderBalance < maxGasCost) {
      throw new Error(`Insufficient sender balance. Need up to ${ethers.formatEther(maxGasCost)} Found ${ethers.formatEther(senderBalance)}`)
    }
    if (verbose) console.log('Max eth transaction fee', ethers.formatEther(maxGasCost))

    const tx = await claim.contract[
      FUNCTION_NAME_CLAIM_DIRECT_MULTISIG
    ].populateTransaction(redeemScript, baseEthAddress);

    // get the nonce last
    const nonce = await claim.signer.getNonce();
    if (verbose) console.log("RPC Nonce: ", nonce);

    // don't send if test
    if (isTest) return "Test completed"

    const txResponse = await claim.signer.sendTransaction({
      to: contractAddress,
      data: tx.data,
      nonce,
      maxFPG,
      maxPFPG,
    });
    if (verbose) console.log("RPC tx response: ", JSON.stringify(txResponse));

    // return the transaction hash
    return txResponse.hash;
  } catch (error) {
    if (error.revert) console.log(Object.keys(error.revert));
    throw error;
  }
}

export { submitClaim, submitMultisigClaim, submitDirectClaim, submitDirectClaimMultisig };
