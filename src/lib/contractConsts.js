// production:
export const ZEND_BACKUP_VAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000409";
/* NEED ADDRESS for ZENBackupVault when deployed on base mainnet */
export const ZENCLAIM_MESSAGE_PREFIX = "ZENCLAIM";

// testnet: base sepolia. (explorer - sepolia.basescan.org) chain id 84532
export const ZEND_BACKUP_VAULT_CONTRACT_ADDRESS_TESTNET = '0x99bC641A2dF505C750a780Fa31C616de2304e537';
export const ZENCLAIM_MESSAGE_PREFIX_TESTNET = "ZT3CLAIM";

// regular address and multisig address
export const FUNCTION_NAME_CLAIM_P2PKH = "claimP2PKH";
export const FUNCTION_NAME_CLAIM_P2SH = "claimP2SH";
export const FUNCTION_NAME_CLAIM_DIRECT = "claimDirect";
export const FUNCTION_NAME_CLAIM_DIRECT_MULTISIG = "claimDirectMultisig";

export const ABI_ZEND_CLAIM = [
  {
      inputs: [
        {
          internalType: "bytes20",
          name: "",
          type: "bytes20",
        },
      ],
      name: "balances",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "destAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes20",
        name: "zenAddress",
        type: "bytes20",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destAddress",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "hexSignature",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "x",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "y",
            type: "bytes32",
          },
        ],
        internalType: "struct ZendBackupVault.PubKey",
        name: "pubKey",
        type: "tuple",
      },
    ],
    name: "claimP2PKH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destAddress",
        type: "address",
      },
      {
        internalType: "bytes[]",
        name: "hexSignatures",
        type: "bytes[]",
      },
      {
        internalType: "bytes",
        name: "script",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "x",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "y",
            type: "bytes32",
          },
        ],
        internalType: "struct ZendBackupVault.PubKey[]",
        name: "pubKeys",
        type: "tuple[]",
      },
    ],
    name: "claimP2SH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "baseDestAddress",
        "type": "address"
      }
    ],
    "name": "claimDirect",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "script",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "baseDestAddress",
        "type": "address"
      }
    ],
    "name": "claimDirectMultisig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

/*  FULL ABI
export const ABI_ZEND_CLAIM = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
      {
        internalType: "string",
        name: "base_message",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AddressNotValid",
    type: "error",
  },
  {
    inputs: [],
    name: "CumulativeHashCheckpointNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "CumulativeHashCheckpointReached",
    type: "error",
  },
  {
    inputs: [],
    name: "CumulativeHashNotValid",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC20NotSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "number",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
    ],
    name: "InsufficientSignatures",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "xOrY",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "expected",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "received",
        type: "bytes32",
      },
    ],
    name: "InvalidPublicKey",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
    ],
    name: "InvalidPublicKeySize",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPublicKeysArraysLength",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidScriptLength",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSignature",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSignatureArrayLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes20",
        name: "zenAddress",
        type: "bytes20",
      },
    ],
    name: "NothingToClaim",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "SignatureMustBe65Bytes",
    type: "error",
  },
  {
    inputs: [],
    name: "SignatureNotMatching",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "StringsInsufficientHexLength",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedOperation",
    type: "error",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "x",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "y",
            type: "bytes32",
          },
        ],
        internalType: "struct ZendBackupVault.PubKey",
        name: "",
        type: "tuple",
      },
    ],
    name: "UnexpectedZeroPublicKey",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "destAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes20",
        name: "zenAddress",
        type: "bytes20",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "_cumulativeHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes20",
        name: "",
        type: "bytes20",
      },
    ],
    name: "balances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "expectedCumulativeHash",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes20",
            name: "addr",
            type: "bytes20",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        internalType: "struct ZendBackupVault.AddressValue[]",
        name: "addressValues",
        type: "tuple[]",
      },
    ],
    name: "batchInsert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destAddress",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "hexSignature",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "x",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "y",
            type: "bytes32",
          },
        ],
        internalType: "struct ZendBackupVault.PubKey",
        name: "pubKey",
        type: "tuple",
      },
    ],
    name: "claimP2PKH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destAddress",
        type: "address",
      },
      {
        internalType: "bytes[]",
        name: "hexSignatures",
        type: "bytes[]",
      },
      {
        internalType: "bytes",
        name: "script",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "x",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "y",
            type: "bytes32",
          },
        ],
        internalType: "struct ZendBackupVault.PubKey[]",
        name: "pubKeys",
        type: "tuple[]",
      },
    ],
    name: "claimP2SH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "cumulativeHashCheckpoint",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "message_prefix",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_cumulativeHashCheckpoint",
        type: "bytes32",
      },
    ],
    name: "setCumulativeHashCheckpoint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "setERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "zenToken",
    outputs: [
      {
        internalType: "contract ZenToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
*/