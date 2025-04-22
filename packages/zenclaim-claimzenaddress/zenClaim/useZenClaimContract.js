// import { ABI_ZEND_CLAIM } from "./contractConsts";
// import { FUNCTION_NAME_CLAIM_P2PKH } from "./contractConsts";
// import { PRECOMPILE_ADDRESS_ZEND_CLAIM } from "./contractConsts";
import { ABI_ZEND_CLAIM, FUNCTION_NAME_CLAIM_P2PKH, PRECOMPILE_ADDRESS_ZEND_CLAIM} from "./contractConsts.js";

import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "./config.js";
// import { mainnet, sepolia } from '@wagmi/core/chains'


const zendAddress = "ztTmj8oJzBo2s8fcewUA3GexNUeWA24Qe8T";
const destinationAddress = "0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
const signature =
  "IDshUoomKkvdKwMM1SVz6LIM+JKHULXnMeZnYzYWEzbNFjwl6/Ie8zfo/AEElcjJ/YQVwdhQILf0WFVcmJzoGL8=";



  
const writeZenClaimContract = async (
  zendAddress,
  destinationAddress,
  signature,
  testnet
) => {
  const { request } = await simulateContract(config, {
    abi: ABI_ZEND_CLAIM,
    address: PRECOMPILE_ADDRESS_ZEND_CLAIM,
    functionName: FUNCTION_NAME_CLAIM_P2PKH,
    args: [zendAddress, destinationAddress, signature],
    // chainId: 9999,
  });
  console.log(request);
  // const hash = await writeContract(config, request)
  // return hash
};

async function useZenClaimContract() {
  //   const { writeContract, status } = useWriteContract();
  //   const isPendingStatus = status === "pending";
  //   const writeZenClaimContract = (
  //     zendAddress: string,
  //     destinationAddress: string,
  //     signature: string
  //   ) => {
  //     writeContract({
  //       abi: ABI_ZEND_CLAIM,
  //       address: PRECOMPILE_ADDRESS_ZEND_CLAIM,
  //       functionName: FUNCTION_NAME_CLAIM_P2PKH,
  //       args: [zendAddress, destinationAddress, signature],
  //     });
  //   };

  //   const writeZenClaimContract = (
  //     zendAddress: string,
  //     destinationAddress: string,
  //     signature: string
  //   ) => {
  //     writeContract({
  //       abi: ABI_ZEND_CLAIM,
  //       address: PRECOMPILE_ADDRESS_ZEND_CLAIM,
  //       functionName: FUNCTION_NAME_CLAIM_P2PKH,
  //       args: [zendAddress, destinationAddress, signature],
  //     });
  //   };

  //TODO add


  // const writeZenClaimContract = async (
  //   zendAddress: string,
  //   destinationAddress: string,
  //   signature: string,
  //   testnet: boolean
  // ) => {
  //   const { request } = await simulateContract(config, {
  //     abi: ABI_ZEND_CLAIM,
  //     address: PRECOMPILE_ADDRESS_ZEND_CLAIM,
  //     functionName: FUNCTION_NAME_CLAIM_P2PKH,
  //     args: [zendAddress, destinationAddress, signature],
  //     // chainId: 9999,
  //   });
  //   console.log(request);
  //   // const hash = await writeContract(config, request)
  //   // return hash
  // };

  //   return { writeZenClaimContract, isPendingStatus };
  return { writeZenClaimContract };
}

writeZenClaimContract(zendAddress, destinationAddress, signature, false); 

export default useZenClaimContract;
