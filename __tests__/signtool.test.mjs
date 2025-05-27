
import { signMessage } from '../bin/signtool.js';

describe('signtool.js', () => {
  const privKey = 'KzFBhL99mZDTdjMhX4jMnybVxkTTACLm6gq9veUjpXcQuXbaAnHf';
  const privKeyRaw = "5a4548fe4ce6a4ae9b23eda6f29ec2078aac1dcd553e0b31c28ff1154d73dd19";
  const privKeyTestnet = 'cSebvnBKGL9CKKj9Tks5faCbPJXHxv8nzrAg32RragJNoLWtgo26';
  const message = "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
  const messageTestnet = "ZT1CLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
  const compressed = true;  //default
  const network = "testnet";
  const verbose = true;
  const multisigMessage ='ZENCLAIM0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x0Fd343F9a263906bD6AfebfDD4011579979E8aeC';

  // response data;
  const expectedAddressTestnet = 'ztfPyquDswoUBUBNNWqcPeZrpD7x7QSE9Zt';
  const expectedSigTestnet = 'G1wd3KLH7bAXxuUfloCGuOVIdEkanj9UKQQuW3Y5dKV/LMpa/qsPrQGAsZPemyNqfu1YLbZ8jJhP2/hHLI2Z8Yc=';
  const expectedSig = 'HHe0yZyQfLbsA19QZf1i8get70ckrRI4FHDRF8A6dHCxYUVJ/us3PdViOnc/7zoBGoCGR65EVCQl7KI9f9IuQXA=';
  const expectedAddressMainnet = 'znfcURubKKLPzURUEvZ8C6VVShkgGQjeu6X';
  const expectedAddressMainnetAlt = 'znVvEqoY9rDfPMX5Sx35UGbycUMedUrHJ6q';
  const expectedAddressCompressedFalse ='znfcURubKKLPzURUEvZ8C6VVShkgGQjeu6X';
  const expectedSigCompressedFalse= 'HHe0yZyQfLbsA19QZf1i8get70ckrRI4FHDRF8A6dHCxYUVJ/us3PdViOnc/7zoBGoCGR65EVCQl7KI9f9IuQXA='
  const expectedSigRaw= 'IHe0yZyQfLbsA19QZf1i8get70ckrRI4FHDRF8A6dHCxYUVJ/us3PdViOnc/7zoBGoCGR65EVCQl7KI9f9IuQXA='
  const expectedSigMultisig = 'HA+OyDIOm+9qSQe92xsABiKm9FZeTNbvGfVBUW4Bg1I7LXEHZDAdlICFF2RdIUkLkEgq3Ms3DgapJ8Lt4HlqGOA=';

  test('signMessage should reject a missing or invalid message', () => {
    const isValid = signMessage({ privKey, network});
    expect(typeof isValid).toBe('object');
    expect(isValid).toHaveProperty('error');
  });
  test('signMessage should reject an invalid private key', () => {
    const isValid = signMessage({message, privKey:'123456'});
    expect(typeof isValid).toBe('object');
    expect(isValid).toHaveProperty('error');
  });
  test('signMessage should return a mainnet address on an invalid testnet', () => {
    const result = signMessage({message, privKey, compressed, network:'invalid testnet'});
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('address');
    expect(result.address).toBe(expectedAddressMainnetAlt);
  });
  test('signMessage should return a different signature and address when commpressed is false', () => {
    const result = signMessage({message, privKey, compressed: false});
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSigCompressedFalse);
    expect(result.address).toBe(expectedAddressCompressedFalse);
  });
  test('signMessage should sign a message and return an object with signature and address', () => {
    const result = signMessage({message, privKey, compressed: false});
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSig);
    expect(result.address).toBe(expectedAddressMainnet);
  });
  test('signMessage should sign a message and return an object with testnet signature and address', () => {
    const result = signMessage({message: messageTestnet, privKey:privKeyTestnet, network:"testnet", compressed: false});
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSigTestnet);
    expect(result.address).toBe(expectedAddressTestnet);
  });
  test('signMessage should sign a message with a raw key and return an object with signature and address', () => {
    const result = signMessage({message, privKey: privKeyRaw, network: "mainnet", compressed})
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSigRaw);
    expect(result.address).toBe(expectedAddressMainnetAlt);
  });
  test('signMessage should return compressed address by default when compressed parameter is not provided', () => {
    const result = signMessage({message, privKey: privKeyRaw, network: "mainnet"})
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSigRaw);
    expect(result.address).toBe(expectedAddressMainnetAlt);
  });
  test('signMessage should sign a multisig formatted message and return an object with signature and address', () => {
    const result = signMessage({message: multisigMessage, privKey, verbose, compressed: false})
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSigMultisig);
    expect(result.address).toBe(expectedAddressMainnet);
  });
});
