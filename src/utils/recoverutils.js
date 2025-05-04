import varuint from 'varuint-bitcoin';
import zencashjs from 'zencashjs';
import secp256k1 from 'secp256k1';
import { isZenAddress, addressToDecodedHex } from './claimutils.js';

// see zencashjs/src/message.js for the origin of the next 3 functions
function _magicHash(message) {
  const MAGIC_BYTES = Buffer.from('Zcash Signed Message:\n', 'utf8');
  var prefix1 = varuint.encode(MAGIC_BYTES.length);
  var messageBuffer = Buffer.from(message, 'utf8');
  var prefix2 = varuint.encode(messageBuffer.length);
  var buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer]);
  return zencashjs.crypto.hash256Buf(buf)
};

function decodeSignature(buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')
  const flagByte = buffer.readUInt8(0) - 27
  if (flagByte > 15 || flagByte < 0) {
    throw new Error('Invalid signature parameter')
  }
  return {
    compressed: !!(flagByte & 12),
    recovery: flagByte & 3,
    signature: buffer.slice(1)
  }
};

function getPublicKeyFromSignature(message, signature) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')
  const parsed = decodeSignature(signature)
  const hash = _magicHash(message)
  const publicKey = secp256k1.recover(
    hash,
    parsed.signature,
    parsed.recovery,
    parsed.compressed
  )
  return publicKey
}

/**
 * Validate a signature against a given zend address.
 *
 * @param {String} zenAddress - A zen address
 * @param {String|Buffer} signPubKey - A base64 encoded compact signature
 * @returns [ {Boolean} true if the signature is valid, (string) publicKey ]
 */
function verifyMatch(zenAddress, sigPubKey) {
  const publicKeyHash = zencashjs.crypto.hash160Buf(sigPubKey).toString("hex");
  const expected = addressToDecodedHex(zenAddress);
  return [(expected === publicKeyHash), sigPubKey.toString("hex")];
  // return [(expected.equals(publicKeyHash)), sigPubKey.toString("hex")];
};


function verifyAndRecoverPubKey(zenAddress, sigPubKey, network, verbose) {
  const testnet = Number(network) || 0;
  if (verbose) console.log(`testnet= ${testnet}`)
  if (!zenAddress || !sigPubKey) {
    return { error: "zenAddress and signature public key are both required" };
  }
  if (!isZenAddress(zenAddress, testnet, false, verbose)) {
    return { error: "Not a valid zenAddress" };
  }
  const [validMessage, pubkeyRecovered] = verifyMatch(zenAddress, sigPubKey);
  if (!validMessage) {
    return { error: `zenAddress ${zenAddress} does not match the public key derived from signature` };
  }
  const pubkeyRecoveredConvertedUncompressed = secp256k1.publicKeyConvert(Buffer.from(pubkeyRecovered, "hex"), false).toString("hex")

  const addr = zencashjs.address.pubKeyToAddr(
    pubkeyRecovered,
    testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash,
  );
  const matches = zenAddress === addr;
  if (!matches) {
    return { error: "zen address does not match the public key derived from signature" };
  }
  const pubkeyXcoordinate = pubkeyRecoveredConvertedUncompressed.slice(2, 66);
  const pubkeyYcoordinate = pubkeyRecoveredConvertedUncompressed.slice(66);
  if (verbose) {
    console.log("zenAddress=", zenAddress);
    console.log("addrsMatch=", matches);
    console.log("validMessage=", validMessage);
    console.log("pubkeyRecoveredUncompressed=", pubkeyRecoveredConvertedUncompressed);
    console.log("pubkeyXcoordinate=", pubkeyXcoordinate);
    console.log("pubkeyYcoordinate=", pubkeyYcoordinate);
  }
  return { pubkeyXcoordinate, pubkeyYcoordinate };
}

export { getPublicKeyFromSignature, verifyAndRecoverPubKey}
