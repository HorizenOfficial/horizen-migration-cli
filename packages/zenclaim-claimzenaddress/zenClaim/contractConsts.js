export const PRECOMPILE_ADDRESS_ZEND_CLAIM =
  "0x0000000000000000000000000000000000000409";

export const ABI_ZEND_CLAIM = [
  {
    inputs: [
      {
        internalType: "string",
        name: "zend_address",
        type: "string",
      },
      {
        internalType: "string",
        name: "destination_address",
        type: "string",
      },
      {
        internalType: "string",
        name: "signature",
        type: "string",
      },
    ],
    name: "claim_p2pkh",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "zend_multisig_address",
        type: "string",
      },
      {
        internalType: "string",
        name: "destination_address",
        type: "string",
      },
      {
        internalType: "string",
        name: "redeem_script",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "signatures",
        type: "string[]",
      },
    ],
    name: "claim_p2sh_multisig",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const ZENCLAIM_MESSAGE_PREFIX = "ZENCLAIM";

export const FUNCTION_NAME_CLAIM_P2PKH = "claim_p2pkh";