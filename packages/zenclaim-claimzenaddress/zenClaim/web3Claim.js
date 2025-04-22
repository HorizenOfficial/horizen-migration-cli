import Web3 from 'web3';
import { PRECOMPILE_ADDRESS_ZEND_CLAIM, ABI_ZEND_CLAIM } from './contractConsts.js';

/*
Test using web3.js to call the claim contract on the testnet.
*/


// Initialize web3 with a provider
const web3 = new Web3('https://testnet-rpc.horizen.io');

// Create a contract instance
const claimContract = new web3.eth.Contract(ABI_ZEND_CLAIM, PRECOMPILE_ADDRESS_ZEND_CLAIM);

// Define the parameters
const zendAddress = "ztTmj8oJzBo2s8fcewUA3GexNUeWA24Qe8T";
const destinationAddress = "0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
// const signature = "IGkuqX6NMU+fOx0I2EAVlLTWeyzqZm+bnlNGw95lFT78ah6Rja4nrg1Qr74hbDS5XSNVANZjy95lc7+3Xg9UrQo="; //with space
const signature = 'IDshUoomKkvdKwMM1SVz6LIM+JKHULXnMeZnYzYWEzbNFjwl6/Ie8zfo/AEElcjJ/YQVwdhQILf0WFVcmJzoGL8='

// Define the function to call the contract
async function callClaimContract(zendAddress, destinationAddress, signature) {
  try {
    // const accounts = await web3.eth.getAccounts();
    const fromAddress = destinationAddress; //accounts[0];
// claimContract.methods(
    const gasEstimate = await claimContract.methods.claim_p2pkh(zendAddress, destinationAddress, signature).estimateGas({ from: fromAddress });
    console.log('Estimated Gas: ', gasEstimate);

    const result = await claimContract.methods.claim_p2pkh(zendAddress, destinationAddress, signature).send({ from: fromAddress, gas: gasEstimate });
    console.log('Transaction Result: ', result);
  } catch (error) {
    console.error('Error calling claim contract: ', error);
    console.log('pause')
  }
}

// Call the function
callClaimContract(zendAddress, destinationAddress, signature);