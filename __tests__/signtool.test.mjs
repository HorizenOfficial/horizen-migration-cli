
import { signMessage } from '../bin/signtool.js';

describe('signtool.js', () => {
  const privKey = 'KzFBhL99mZDTdjMhX4jMnybVxkTTACLm6gq9veUjpXcQuXbaAnHf';
  const message = "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
  const messageTestnet = "ZT1CLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
  const compressed = true;  //default
  const network = "testnet";
  const verbose = true;
  const multisigMessage ='ZT1CLAIM0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x0Fd343F9a263906bD6AfebfDD4011579979E8aeC';

  // response data;
  let result = null;
  let isValid = null;
  const expectedAddressTestnet = 'ztXzHcS1UVvcXd2AkKL5FYV4QuvWn9ix16C';
  const expectedSig = 'IHe0yZyQfLbsA19QZf1i8get70ckrRI4FHDRF8A6dHCxYUVJ/us3PdViOnc/7zoBGoCGR65EVCQl7KI9f9IuQXA=';
  const expectedAddressMainnet = 'znVvEqoY9rDfPMX5Sx35UGbycUMedUrHJ6q';
  const expectedSigCompressedFalse = 'IGVVfimVlXoZgv/W8z2BWehZ42IC8Idf4UogyV7VW0MUIeMADEP4bJlVjJScVegXE3RT11aHCROqCcyq4EG+Hec=';
  const expectedSigMultisig = 'Hxz8yEDGwf7fXuYEKKmoQIf5TeYQaA2Gga2BOwggAQTLJWeRlGThLr8y1jiwgJ+QxudvYXIAo2OG+PhT9AQtAbQ=';
  // const expectedAddressCompressedFalse = 'zthgXCY4dy3M8jvZYHr7yNNaF9KYR24ACfb';

  test('signMessage should reject a missing or invalid message', () => {
    isValid = signMessage({ privKey});
    expect(typeof isValid).toBe('object');
    expect(isValid).toHaveProperty('error');
  });
  test('signMessage should reject an invalid private key', () => {
    isValid = signMessage({message, privKey:'123456'});
    expect(isValid).toHaveProperty('error');
  });
  test('signMessage should return a mainnet address on an invalid testnet', () => {
    result = signMessage({message, privKey, compressed, network:'invalid testnet'});
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('address');
    expect(result.address).toBe(expectedAddressMainnet);
  });
  test('signMessage should return a alternate message and address when commpressed is false', () => {
    result = signMessage({message: messageTestnet, privKey, compressed: false, network, verbose});
    expect(typeof result).toBe('object');
    expect(result.address).toBe(expectedAddressTestnet);
    expect(result.signature).toBe(expectedSigCompressedFalse);
  });
  test('signMessage should sign a message and return an object with signature and address', () => {
    result = signMessage({message, privKey})
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSig);
    expect(result.address).toBe(expectedAddressMainnet);
  });
  test('signMessage should sign a multisig formatted message and return an object with signature and address', () => {
    result = signMessage({message: multisigMessage, privKey, verbose})
    expect(typeof result).toBe('object');
    expect(result.signature).toBe(expectedSigMultisig);
    expect(result.address).toBe(expectedAddressMainnet);
  });
});
