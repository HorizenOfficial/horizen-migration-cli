import zencashjs from "zencashjs";
import { isZenAddress, checkPrivKeyWif } from "./claimutils.js";
import { publicKeyToAddr } from "./claimutils.js";
import el from 'elliptic';
const EC = el.ec;
const ec = new EC('secp256k1'); // or other curve

function validPrivateKey(privateKeyHex) {
    try {
        // Check if the private key is a valid hex string with 64 characters
        if (!/^[0-9a-fA-F]{64}$/.test(privateKeyHex)) {
            throw new Error("Private key is not a valid hex string.");
        }
        // Get the key pair
        const key = ec.keyFromPrivate(privateKeyHex, 'hex');
        // Check if the key is valid
        return key.validate().result;
    } catch (error) {
        return false;
    }
}

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
        let pk;
        if (checkPrivKeyWif(privKey, testnet, verbose)) {
            pk = zencashjs.address.WIFToPrivKey(privKey, compressed, testnet ? zencashjs.config.testnet.wif : zencashjs.config.mainnet.wif);
        } else {
            pk = privKey
        }
        if (!validPrivateKey(pk)) throw new Error("Unable to validate private key");

        const pubkey = zencashjs.address.privKeyToPubKey(pk, compressed);
        if (verbose) console.log(`public key= ${pubkey}`)
        const addr = publicKeyToAddr(pubkey, testnet);
        if (isZenAddress(addr, testnet, false, verbose))
            return { privateKey: pk, publicKey: pubkey, address: addr };

    } catch (error) {
        throw new Error(error.message || 'Invalid private key');        
    }
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

export { sign, validPrivateKey };
