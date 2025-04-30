import zencashjs from "zencashjs"
import bscript from "bitcoinjs-lib/src/script.js"
import OPCODES from "bitcoinjs-lib/src/ops.js"
import { getPublicKeyFromSignature, verifyAndRecoverPubKey, base58DecodeZenAddress } from '../zenclaim-recoverpubkey/recoverutils.js';

const OP_INT_BASE = OPCODES.OPS.OP_RESERVED;
const checkRedeemScript = (rscript) => {
    // Check if the redeemScript is a valid hex string
    if (!/^[0-9a-fA-F]+$/.test(rscript)) {
        return false;
    }
    console.log("check rscript. length=", rscript.length);
    if (rscript.length === 0 || rscript.length < 120) {

        return false;
    }
    return true
}

const decodeZenAddress = (address) => {
    return base58DecodeZenAddress(address);
}
/**
 *
 * @param {string} pubKey  public key
 * @param {string or number} tnet  0 or 1
 * @returns the zen address of the public key
 */

function pubKeyToAddr(pubKey, tnet) {
    const testnet = Number(tnet) || 0;
    return zencashjs.address.pubKeyToAddr(
        pubKey,
        testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash,
    );
}

/**
 *
 * @param {string} script  reedem script from multisig
 * @returns object with number of signers, required number of signers and public keys of signers
 */
function decode(script) {
    const o = {};
    const output = Buffer.from(script, "hex");
    const chunks = bscript.decompile(output);

    o.requiredSigs = Number(chunks[0]) - OP_INT_BASE;
    o.totalSigs = chunks[chunks.length - 2] - OP_INT_BASE;
    const pubkeys = chunks.slice(1, -2);
    o.pubkeys = pubkeys.map((p) => p.toString("hex"));
    return o;
}

/**
   *
   * @param {string} rscript  redeem script
   * @param {number} testnet 0 or 1
   * @returns Multisig object with signer's public keys and zen addresses
   */
function decodeMulti(rscript, testnet, verbose) {
    try {
        if (verbose) console.log("ZEN decode redeemscript", rscript);
        const ms = decode(Buffer.from(rscript, "hex"));
        if (verbose) console.log("ZEN decoded", ms);
        const addr = zencashjs.address.multiSigRSToAddress(
            rscript,
            testnet ? zencashjs.config.testnet.scriptHash : zencashjs.config.mainnet.scriptHash,
        );
        ms.address = addr;
        if (verbose) console.log("ZEN decode multisig addr", addr);
        ms.addresses = ms.pubkeys.map((a) => pubKeyToAddr(a, testnet));
        return ms;
    } catch (error) {
        if (verbose) console.log(error);
        return { error };
    }
}

function validateSignatures(signatures, multisig) {
    if (!Array.isArray(signatures) || signatures.length === 0) {
        return { error: `Signatures must be a non-empty array of ${multisig.requiredSigs} base64 strings` };
    }
    if (signatures.length !== multisig.requiredSigs) {
        return { error: `Incorrect number of signatures. Expected ${multisig.requiredSigs}, got ${signatures.length}` };
    }
    return null;
}
function verifySigsAndGetCoords(signatures, multisig, message, testnet, verbose) {
    // Loop through the signatures and check if they are valid for the message and zenAddress
    // create arrays of sigs and pubkeys in same order as multisig pubkeys

    const addrs = [...multisig.addresses];
    const pkFill = "0x" + "0".repeat(64);
    const orderedPubKeyCoords = new Array(addrs.length).fill([pkFill, pkFill]);
    const orderedSignatures = new Array(addrs.length).fill(Buffer.from("", "base64"));
    for (let i = 0; i < signatures.length; i++) {
        const sigPubKey = getPublicKeyFromSignature (message, signatures[i])
        for (let x = 0; x < addrs.length; x++) {
            const result = verifyAndRecoverPubKey(addrs[x], sigPubKey, testnet, verbose);
            if (result.pubkeyXcoordinate) {
                orderedPubKeyCoords[x] = [`0x${result.pubkeyXcoordinate}`, `0x${result.pubkeyYcoordinate}`];
                orderedSignatures[x] = Buffer.from(signatures[i], "base64");
                break
            }
        }
    }
    return [orderedPubKeyCoords, orderedSignatures]
}

export {
    checkRedeemScript,
    decodeMulti,
    validateSignatures,
    verifySigsAndGetCoords,
    decodeZenAddress
}

