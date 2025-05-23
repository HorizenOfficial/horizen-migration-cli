import { deriveClaimDirectAddress } from '../bin/deriveclaimdirectaddress.js';

describe('deriveclaimdirectaddress.js', () => {
  const validTestnetOptions = {
    baseEthAddress: "0xC2a0780E419d610C7a88800EC74628072f1d4c16",
    zenAddress: "ztnnSPL5ymx6X2EgoQxvM3hsU7L6isku8x9",
    network: "testnet",
  }

  test('deriveClaimDirectAddress should return an error for missing ETH address', async () => {
    const invalidOptions = { ...validTestnetOptions, baseEthAddress: null };
    const result = deriveClaimDirectAddress(invalidOptions);
    console.log('result', result)
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('deriveClaimDirectAddress should return an error for invalid ETH address', async () => {
    const invalidOptions = { ...validTestnetOptions, baseEthAddress: "12345" };
    const result = deriveClaimDirectAddress(invalidOptions);
    console.log('result', result)
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('deriveClaimDirectAddress should return a ZEN address for a valid ETH address', async () => {
    const result = deriveClaimDirectAddress(validTestnetOptions);
    console.log('result', result);
    expect(typeof result).toBe('string');
    expect(result).toBe(validTestnetOptions.zenAddress);
  });
});
