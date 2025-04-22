import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from "bip39";
import zencashjs from "zencashjs"

// wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory.default(ecc);

const BIP32 = {
  DERIVATION_PATH_BASE: "m/44'",
  COIN: {
    ZEN: "121'",
  },
  CHANGE_CHAIN: {
    EXTERNAL: 0,
    INTERNAL: 1,
  },
};
const bip32Network = {
  mainnet: {
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 2089,
    scriptHash: 2096,
    wif: 0x80,
  },
  testnet: {
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 2098,
    scriptHash: 2092,
    wif: 0xef,
  },
};

let verbose = false;

/* the following are adapted from horizen vault UtilityService */
/**
 *
 * @param {string} phrase
 * @returns seed phrase converted to an array of individual words
 */
const phraseToArray = (phrase) => {
  // for multibyte characters (like japanese)
  const delimiter = phrase.indexOf("\u3000") !== -1 ? "\u3000" : " ";
  return phrase
    .replace(/\s*$|^\s+/g, "")
    .replace(/[\n\r]/g, "")
    .split(delimiter)
    .filter((word) => word !== "");
}

/**
   *
   * @param {string} phrase  seed phrase
   * @returns {object}  cleaned phrase as array
   */
const phraseCheck = (phrase) => {
  const clean = phraseToArray(phrase);
  if (verbose) console.log("phraseCheck", clean);
  let pwd = null;
  if (clean.length !== 12 && clean.length !== 24) {
    if (clean.length === 13) { pwd = clean[12]; }
    else if (clean.length === 25) { pwd = clean[24]; }
    else {
      return { error: `Incorrect number of words in phrase. Only 12 and 24 words supported. ${clean.length} found.` }
    };

  }
  return { phrase: clean.join(" "), pwd };
}

// /**
// *
// * @param {hdNode} bip32RootKey  hdNode
// * @param {string} path  derivation path
// * @returns BIP32 extended public key
// */
// function calcBip32ExtendedKey(bip32RootKey, path) {
//   // Check there's a root key to derive from
//   if (!bip32RootKey) {
//     return bip32RootKey;
//   }
//   let extendedKey = bip32RootKey;
//   // Derive the key from the path
//   const pathBits = path.split("/");
//   for (let i = 0; i < pathBits.length; i++) {
//     const bit = pathBits[i];
//     const index = parseInt(bit);
//     if (isNaN(index)) {
//       continue;
//     }
//     const hardened = bit[bit.length - 1] == "'";
//     const isPriv = !extendedKey.isNeutered();
//     const invalidDerivationPath = hardened && !isPriv;
//     if (invalidDerivationPath) {
//       extendedKey = null;
//     } else if (hardened) {
//       extendedKey = extendedKey.deriveHardened(index);
//     } else {
//       extendedKey = extendedKey.derive(index);
//     }
//   }
//   return extendedKey;
// }

/**
   *
   * @param {string} privKey  private key
   * @param {string or number} tnet 0 or 1
   * @returns string - Wallet Import Format of private key
   */
const getWIF = (privKey, tnet) => {
  const testnet = Number(tnet) || 0;
  return zencashjs.address.privKeyToWIF(
    privKey,
    true,
    testnet ? zencashjs.config.testnet.wif : zencashjs.config.mainnet.wif,
  );
}

/*  Derive Addresses/Keys  */
/**
 *
 * @param {number} numAddresses quantity of addresses to return
 * @param {string} mnPhrase  multiword phrase
 * @param {string} mnPassword  optional password to protect the seed phrase
 * 
 * @param {string} dPathAcct  account number to use in path for deriving addresses
 * 
 * @param {number} offset  derive addresses after skipping this number
 * @param {string or number} tnet 0 or 1
 * @param {boolean} verbose  output addtional values
 * @returns object with path, addresses, and keys
 */
const deriveFromPhrase = async (numAddresses, mnPhrase, mnPassword, derivationPrefix, offset, tnet, verbose) => {
  try {
    const checked = phraseCheck(mnPhrase);
    if (checked.error)
      return {
        error: checked.error,
      };
    // console.log("ZEN checked", checked)
    const mnemonicPhrase = checked.phrase;
    const mnemonicPassword = mnPassword || checked.pwd || "";
    // const derivationPathAccount = dPathAcct || 0;
    const testnet = Number(tnet) || 0;
    if (verbose) console.log("testnet=", testnet);

    const addrKeys = [];
    const network = testnet ? bip32Network.testnet : bip32Network.mainnet;

    // const derivationPrefix = `${BIP32.DERIVATION_PATH_BASE}/${BIP32.COIN.ZEN}/${derivationPathAccount}'/${BIP32.CHANGE_CHAIN.EXTERNAL}/`;
    // const derivationPrefix = dPathAcct
    if (verbose) console.log("path prefix=", derivationPrefix);
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase, mnemonicPassword);
    if (verbose) console.log("seed=", seed.toString('hex'));


    const hdNode = bip32.fromSeed(seed, network);
    const quantity = numAddresses + offset;
    if (verbose) console.log(`offset= ${offset}`)
    if (verbose) console.log(`number of addresses= ${quantity}`)
    for (let i = offset; i < quantity; ++i) {
      const derivationPath = derivationPrefix + i.toString();
      const hdNodeDerived = hdNode.derivePath(derivationPath);
      // console.log("ZEN hnode=", hdNodeDerived);
      const privKey = hdNodeDerived.privateKey.toString("hex");
      // if (verbose) console.log("ZEN privkey=", privKey);
      const pubKey = zencashjs.address.privKeyToPubKey(privKey, true);
      const pubKeyUncompressed = zencashjs.address.privKeyToPubKey(privKey, false);
      const addressUncompressed = zencashjs.address.pubKeyToAddr(pubKeyUncompressed, testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash);
      const WIF = getWIF(privKey, testnet);
      const address = zencashjs.address.pubKeyToAddr(
        pubKey,
        testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash,
      );
      addrKeys.push({
        derivationPath,
        address,
        pubKey,
        addressUncompressed,
        pubKeyUncompressed,
        privKeyRaw: privKey,
        privKeyWIF: WIF,
      });
    }

    // if (verbose) {
    //   const accountExtendedKey = calcBip32ExtendedKey(hdNode, derivationPrefix);
    //   const accountXprv = accountExtendedKey.toBase58();
    //   console.log(`account privkey="${accountXprv}`);
    //   const xpubkey = accountExtendedKey.neutered().toBase58();
    //   console.log(`extended public key="${xpubkey}`);
    // }
    if (verbose) console.info("derived count=", addrKeys.length);
    return addrKeys;
  } catch (error) {
    return { error: error.message }
  }
}

export { deriveFromPhrase }