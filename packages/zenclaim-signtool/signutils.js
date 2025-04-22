import zencashjs from "zencashjs"

/**
 *
 * @param {string} h  a hex string
 * @returns boolean
 */
const isHexKey = (h) => {
    try {
        const re = /^[A-Fa-f0-9]+$/;
        const b = h.match(re);
        return b[0] === h;
    } catch (err) {
        return false;
    }
};

/**
 *
 * @param {string} privKey  private key
 * @returns converts to raw format if in WIF format
 */
const checkPrivKeyForm = (privKey) => {
    return !isHexKey(privKey) ? zencashjs.address.WIFToPrivKey(privKey) : privKey;
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
const signMessage = (message, privKey, compressed, testnet, verbose) => {
    const checkedPk = checkPrivKeyForm(privKey);
    const signature = zencashjs.message.sign(message, checkedPk, compressed);
    const pubKey = zencashjs.address.privKeyToPubKey(checkedPk, compressed)
    if (verbose) console.log(`public key= ${pubKey}`)
    const address = pubKeyToAddr(pubKey, testnet)
    return { signature: signature.toString('base64'), address }
}

export {
    signMessage
}