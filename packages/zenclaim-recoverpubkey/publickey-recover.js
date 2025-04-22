#!/usr/bin/env node

if (process.argv.length < 4) {
  console.error('Usage: node pubkey_recover.js "message" "mnemonic Phrase" "mnemonicPassword"(optional) derivationPathAccount(optional, default 0) testnet(optional, default 0)');
  process.exit(1);
}
const bip32 = require('bip32');
const bip39 = require('bip39');
const zencashjs = require('zencashjs');
const varuint = require('varuint-bitcoin');
const secp256k1 = require('secp256k1');
const bs58check = require('bs58check');
const message = process.argv[2];
const mnemonicPhrase = process.argv[3];
var mnemonicPassword = "";
var derivationPathAccount = 0;
var testnet = 0;
if (process.argv[4]) {
  mnemonicPassword = process.argv[4];
}
if (process.argv[5]) {
  derivationPathAccount = process.argv[5];
}
if (process.argv[6]) {
  testnet = process.argv[6];
}
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
      private: 0x0488ade4
    },
    wif: 0x80
  },
  testnet: {
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    wif: 0xef
  }
};
// see zencashjs/src/message.js for the origin of the next 3 functions
function _magicHash(message) {
  const MAGIC_BYTES = Buffer.from('Zcash Signed Message:\n', 'utf8');
  var prefix1 = varuint.encode(MAGIC_BYTES.length);
  var messageBuffer = Buffer.from(message, 'utf8');
  var prefix2 = varuint.encode(messageBuffer.length);
  var buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer]);
  return zencashjs.crypto.hash256Buf(buf)
};
function decodeSignature (buffer) {
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
// modified to also return recovered publicKey
/**
 * Validate a signature against a given zend address.
 *
 * @param {String} message - the message to verify
 * @param {String} zenAddress - A zen address
 * @param {String|Buffer} signature - A base64 encoded compact signature
 * @returns [ {Boolean} true if the signature is valid, (string) publicKey ]
 */
function verify(message, zenAddress, signature) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')
  const parsed = decodeSignature(signature)
  const hash = _magicHash(message)
  const publicKey = secp256k1.recover(
    hash,
    parsed.signature,
    parsed.recovery,
    parsed.compressed
  )
  const publicKeyHash = zencashjs.crypto.hash160Buf(publicKey)
  let actual, expected
  actual = publicKeyHash
  // prefix is 2 bytes in zencash instead of 1
  expected = bs58check.decode(zenAddress).slice(2)
  return [ (expected.equals(actual)), publicKey.toString("hex") ];
};
var keyObj = [];
const derivationPrefix = `${BIP32.DERIVATION_PATH_BASE}/${BIP32.COIN.ZEN}/${derivationPathAccount}'/${BIP32.CHANGE_CHAIN.EXTERNAL}`;
const seed = bip39.mnemonicToSeed(mnemonicPhrase, mnemonicPassword);
const bip32RootPrv = bip32.fromSeed(seed, testnet ? bip32Network.testnet : bip32Network.mainnet).toBase58();
const bip32xPrv = bip32.fromBase58(bip32RootPrv, testnet ? bip32Network.testnet : bip32Network.mainnet).derivePath(derivationPrefix).toBase58();
const bip32xPub = bip32.fromBase58(bip32xPrv, testnet ? bip32Network.testnet : bip32Network.mainnet).neutered().toBase58();
const i = 0;
const derivationPath = derivationPrefix + "/" + i.toString();
const privKey = bip32.fromBase58(bip32xPrv, testnet ? bip32Network.testnet : bip32Network.mainnet).derive(i).privateKey.toString("hex");
const pubKey = bip32.fromBase58(bip32xPub, testnet ? bip32Network.testnet : bip32Network.mainnet).derive(i).publicKey.toString("hex");
const pubKeyUncompressed = zencashjs.address.privKeyToPubKey(privKey, false);
const privKeyWIF = zencashjs.address.privKeyToWIF(privKey, true, testnet ? zencashjs.config.testnet.wif : zencashjs.config.mainnet.wif);
const address = zencashjs.address.pubKeyToAddr(pubKey, testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash);
const addressUncompressed = zencashjs.address.pubKeyToAddr(pubKeyUncompressed, testnet ? zencashjs.config.testnet.pubKeyHash : zencashjs.config.mainnet.pubKeyHash);
const signedMessage = zencashjs.message.sign(message, privKey, true).toString("hex");
const signedMessageUncompressed = zencashjs.message.sign(message, privKey, false).toString("hex");
// the pubkey format for submission to the claim contract needs to strip the most significant byte from the pubkey and the uncompressed pubKey is needed
// uncompressed pubkey structure 1byte header (0x04 for uncompressed) + x coordinate on curve (32 bytes) + y coordinate on curve (32 bytes)
const [ validMessage, pubkeyRecovered ] = verify(message, address, Buffer.from(signedMessage, "hex"));
const [ validMessageUncompressed, pubkeyRecoveredUncompressed ] = verify(message, addressUncompressed, Buffer.from(signedMessageUncompressed, "hex"));
const pubkeyRecoveredConvertedUncompressed = secp256k1.publicKeyConvert(Buffer.from(pubkeyRecovered , "hex"), false).toString("hex")
console.assert(pubKey === pubkeyRecovered)
console.assert(pubKeyUncompressed === pubkeyRecoveredUncompressed && pubKeyUncompressed === pubkeyRecoveredConvertedUncompressed)
keyObj.push({
  derivationPath,
  pubKey,
  pubKeyUncompressed,
  address,
  addressUncompressed,
  privKey,
  privKeyWIF,
  message,
  signedMessage,
  signedMessageUncompressed,
  validMessage,
  validMessageUncompressed,
  pubkeyRecovered,
  pubkeyRecoveredUncompressed,
  pubkeyRecoveredConvertedUncompressed
});
console.info(JSON.stringify(keyObj, null, 2));
process.exit(0);
