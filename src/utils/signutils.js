import zencashjs from "zencashjs";
import { isZenAddress, checkPrivKeyWif } from "./claimutils.js";
const isBase58 = value => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

/**
 *
 * @param {string} privKey  private key
 * @returns converts to raw format if in WIF format
 */
/**
 * 
 * @param {string} privKey  key in WIF or raw format
 * @param {boolean} compressed  compress signature and public key
 * @param {number} testnet 1 for testnet, 0 for mainet
 * @param {boolean} verbose  display additional values to help check for errors
 * @returns object with private key, public key and zen address
 *
 */
const checkPrivKey = (privKey, compressed, testnet, verbose) => {
    try {
        
        if (checkPrivKeyWif(privKey, testnet, verbose)) {
            const pk = zencashjs.address.WIFToPrivKey(privKey, compressed, testnet ? zencashjs.config.testnet.wif : zencashjs.config.mainnet.wif);
            const pubkey = zencashjs.address.privKeyToPubKey(pk, compressed);
            if (verbose) console.log(`public key= ${pubkey}`)
                const addr = pubKeyToAddr(pubkey, testnet);
            if (isZenAddress(addr, testnet, false, verbose)) 
                return { privateKey: pk, publicKey: pubkey, address: addr };
            
            throw new Error("Invalid private key");
        } else { 
            const pk = zencashjs.address.privKeyToWIF(privKey, compressed, testnet ? zencashjs.config.testnet.wif : zencashjs.config.mainnet.wif);
            return checkPrivKey(pk, compressed, testnet, verbose);
        }
    } catch (error) {
        throw new Error(`Invalid private key. ${error.message}`);        
    }
}
/**
 *
 * @param {string} pubKey  public key
 * @param {string or number} tnet  0 or 1
 * @returns the zen address of the public key
 */
const pubKeyToAddr = (pubKey, tnet) => {
    const testnet = Number(tnet) || 0;
    return zencashjs.address.pubKeyToAddr(
        pubKey,
        testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash,
    );
}
/**
 * 
 * @param {string} message  message to sign
 * @param {string} privKey  privateKey in raw or WIF format
 * @param {boolean} compressed compress signature and public key
 * @param {number} testnet 1 for testnet, 0 for mainet
 * @returns object with signature and zen address
 */
const sign = (message, privKey, compressed, testnet, verbose) => {
    const checked = checkPrivKey(privKey, compressed, testnet, verbose);
    const signature = zencashjs.message.sign(message, checked.privateKey, compressed);
    return { signature: signature.toString('base64'), address: checked.address };
}

export {
    sign
}