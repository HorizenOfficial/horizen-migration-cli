
import { recoverPubkey } from '../bin/recoverpubkey.js';

describe('recoverPubkey.js', () => {
  // privKey used = 'KzFBhL99mZDTdjMhX4jMnybVxkTTACLm6gq9veUjpXcQuXbaAnHf';
  const messageMainnet = "ZENCLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
  const addressMainnet = 'znVvEqoY9rDfPMX5Sx35UGbycUMedUrHJ6q';
  const sigMainnet = 'IHe0yZyQfLbsA19QZf1i8get70ckrRI4FHDRF8A6dHCxYUVJ/us3PdViOnc/7zoBGoCGR65EVCQl7KI9f9IuQXA=';

  const messageTestnet = "ZT1CLAIM0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC";
  const addressTestnet = 'ztXzHcS1UVvcXd2AkKL5FYV4QuvWn9ix16C';
  const sigTestnet = 'IGVVfimVlXoZgv/W8z2BWehZ42IC8Idf4UogyV7VW0MUIeMADEP4bJlVjJScVegXE3RT11aHCROqCcyq4EG+Hec='
  
  const messageMultisig ='ZT1CLAIM0x7caa11b3e0cdf22e9af9a4c5ac1cdc80938c34180x0Fd343F9a263906bD6AfebfDD4011579979E8aeC';
  const sigMultisig = 'Hxz8yEDGwf7fXuYEKKmoQIf5TeYQaA2Gga2BOwggAQTLJWeRlGThLr8y1jiwgJ+QxudvYXIAo2OG+PhT9AQtAbQ=';

  // options = {message , zenAddress, signature, network) 
  
  test('recoverPubkey should return an error a missing message', () => {
    const result = recoverPubkey({zenAddress: addressMainnet, signature: sigMainnet});
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('error');
  });
  test('recoverPubkey should return an error on a missing zenAddress', () => {
    const result = recoverPubkey({message: messageMainnet,  signature: sigMainnet});
    expect(result).toHaveProperty('error');
  });
  test('recoverPubkey should return an error on a missing signature', () => {
    const result = recoverPubkey({message: messageMainnet, zenAddress: addressMainnet});
    expect(result).toHaveProperty('error');
  });
  test('recoverPubkey should return an error on incorrect message', () => {
    const result = recoverPubkey({message: messageTestnet, zenAddress: addressMainnet, signature: sigMainnet});
    expect(result).toHaveProperty('error');
  });

  test('recoverPubkey should return pubkeys coordinates for a testnet message and signature', () => {
    const result = recoverPubkey({message: messageTestnet, zenAddress: addressTestnet, signature: sigTestnet, network:'testnet'});
    expect(result).toHaveProperty('pubkeyXcoordinate');
  });
  test('recoverPubkey should return pubkeys coordinates for a mainnet message and signature', () => {
    const result = recoverPubkey({message: messageMainnet, zenAddress: addressMainnet, signature: sigMainnet});
    expect(result).toHaveProperty('pubkeyXcoordinate');
  });
  test('recoverPubkey should return pubkeys coordinates for a testnet multisig message and signature', () => {
    const result = recoverPubkey({message: messageMultisig, zenAddress: addressTestnet, signature: sigMultisig, network:'testnet'});
    expect(result).toHaveProperty('pubkeyXcoordinate');
  });

  test('recoverPubkey should return false on invalid signature', () => {
    const result = recoverPubkey({message: messageMainnet, zenAddress: addressMainnet, signature: sigTestnet})
    expect(result).toHaveProperty('error');
  });
});
