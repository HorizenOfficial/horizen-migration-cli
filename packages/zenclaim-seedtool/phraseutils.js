import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from "bip39";
import zencashjs from "zencashjs"

// wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory.default(ecc);

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
  
    // accept any string as a phrase.
    const mnemonicPhrase = mnPhrase;
    const mnemonicPassword = mnPassword || "";
    const testnet = Number(tnet) || 0;
    if (verbose) console.log("testnet=", testnet);

    const addrKeys = [];
    const network = testnet ? bip32Network.testnet : bip32Network.mainnet;

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
      const privKey = hdNodeDerived.privateKey.toString("hex");
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