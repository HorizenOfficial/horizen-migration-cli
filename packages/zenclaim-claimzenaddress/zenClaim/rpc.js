import { ABI_ZEND_CLAIM, FUNCTION_NAME_CLAIM_P2PKH, PRECOMPILE_ADDRESS_ZEND_CLAIM } from "./contractConsts.js";
import { ethers } from "ethers";
import { rpcURLs } from "../../mainconfig.js";


/*
    Test using ethers.js to call the claim contract on the testnet.
*/

let provider

// const num = await provider.getBlockNumber();
// console.log('block num ', num);


// const feeData = await provider.getFeeData()
// console.log('fee data ', feeData);
// const gasPrice = feeData.gasPrice;
// // const maxFeePerGas = 20000000000  || feeData.maxFeePerGas
// const maxFeePerGas = feeData.maxFeePerGas
// const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas

// console.log('gas price ', gasPrice);




// console.log(claimContract)

// testnet values
// const zend_address = "ztTmj8oJzBo2s8fcewUA3GexNUeWA24Qe8T";
// const signature = 'IDshUoomKkvdKwMM1SVz6LIM+JKHULXnMeZnYzYWEzbNFjwl6/Ie8zfo/AEElcjJ/YQVwdhQILf0WFVcmJzoGL8='; // no space

// const destination_address = "0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";

const setProvider = async (testnet, verbose) => {
  const endpoint = testnet ? rpcURLs.testnet : rpcURLs.mainnet;
  provider = new ethers.JsonRpcProvider(endpoint);
  if (verbose) {
    console.log('RPC Provider set to: ', endpoint);
    const num = await provider.getBlockNumber();
    console.log('RPC Block number is ', num);
  }
}

const checkClaimAddressBalance = async (claim_address, testnet, verbose) => {
  if (!provider) setProvider(testnet, verbose);

  const balance = await provider.getBalance(claim_address);
  if(verbose) console.log(`RPC Claim address ${claim_address} has a balance of ${ethers.formatEther(balance)}`);

  return balance;
}

async function sendDataToSmartContract(zend_address, destination_address, signature, senderAddressPrivKey, maxFeePerGas, maxPriorityFeePerGas, testnet, verbose) {
  try {
    if (!provider) setProvider(testnet, verbose);
    if (verbose) console.log('RPC Prepping data for smart contract');
    if (verbose) console.log(`RPC maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas-${maxPriorityFeePerGas}`);
    const wallet = new ethers.Wallet(senderAddressPrivKey, provider);
    const signer = wallet.connect(provider);
    const claimContract = new ethers.Contract(PRECOMPILE_ADDRESS_ZEND_CLAIM, ABI_ZEND_CLAIM, provider);

     const feeData = await provider.getFeeData()
    // console.log('fee data ', feeData);
     const gasPrice = feeData.gasPrice;

    const tx = await claimContract[FUNCTION_NAME_CLAIM_P2PKH].populateTransaction(zend_address, destination_address, signature);

    // Estimate gas
    const estimatedGas = await signer.estimateGas({
      type: 2,
      to: PRECOMPILE_ADDRESS_ZEND_CLAIM,
      data: tx.data,
      maxFeePerGas,
      maxPriorityFeePerGas
    });
   const gasLimit = estimatedGas.add(ethers.BigNumber.from('100000')); // Adding a buffer to the estimated gas

    // get the nonce last
    const nonce = await provider.getTransactionCount(destination_address);
    if (verbose) console.log('RPC Nonce: ', nonce);

    const txResponse = await signer.sendTransaction({
      to: PRECOMPILE_ADDRESS_ZEND_CLAIM,
      data: tx.data,
      gasLimit,
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas
    });
    if (verbose) console.log('RPC tx response: ', JSON.stringify(txResponse));

    //  debugging
    // wait() throws an error on successful txResponse.  no reason given in the error. default conf count is 1 block
    // const txReceipt = await txResponse.wait();
    // if (verbose) console.log('RPC Transaction Receipt: ', txReceipt);
    // return txReceipt;

    // return the tx hash
    return txResponse.hash;

  } catch (error) {
    console.error('Error sending data to smart contract: ', error);
    if (error.revert) console.log(Object.keys(error.revert))
    throw error;
  }
}

export { checkClaimAddressBalance, sendDataToSmartContract }
