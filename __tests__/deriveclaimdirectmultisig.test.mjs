import { deriveClaimDirectMultisig } from '../bin/deriveclaimdirectmultisig.js';

describe('deriveclaimdirectmultisig.js', () => {
  const validTestnetOptions = {
    zenAddressPubKey: "02d1edd723d043e62f1c6407b1876126b8b21e688922a0b7c858154befcfd1f8cf",
    baseEthAddress: "0xC2a0780E419d610C7a88800EC74628072f1d4c16",
    claimDirectMultisigEthereumDerivedRedeemScriptCompressed: "512102d1edd723d043e62f1c6407b1876126b8b21e688922a0b7c858154befcfd1f8cf210212124ea744199d7d2875312b37fe9abd04cd68395297341b9fe6493f2b4f8f8352ae",
    claimDirectMultisigEthereumDerivedAddressCompressed: "zrP5ZXf5awakuSE6UbmdT4pBy9CcRByAtx8",
    network: "testnet",
  }

  const validTestnetOptionsUncompressed = {
    zenAddressPubKey: "04d1edd723d043e62f1c6407b1876126b8b21e688922a0b7c858154befcfd1f8cfe990e74c75a5f2e1c9c7556e8312c82211f8dc2105758b6543eca3811eb4c3d0",
    baseEthAddress: "0xC2a0780E419d610C7a88800EC74628072f1d4c16",
    claimDirectMultisigEthereumDerivedRedeemScriptUncompressed: "514104d1edd723d043e62f1c6407b1876126b8b21e688922a0b7c858154befcfd1f8cfe990e74c75a5f2e1c9c7556e8312c82211f8dc2105758b6543eca3811eb4c3d0210212124ea744199d7d2875312b37fe9abd04cd68395297341b9fe6493f2b4f8f8352ae",
    claimDirectMultisigEthereumDerivedAddressUncompressed: "zrJfQ3BY88Du5z8G4Z7dDPpmgqhTvpZJ4nw",
    network: "testnet",
  }

  test('deriveClaimDirectMultisig should return an error for missing ETH address', async () => {
    const invalidOptions = { ...validTestnetOptions, baseEthAddress: null };
    const result = deriveClaimDirectMultisig(invalidOptions);
    console.log('result', result)
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('deriveClaimDirectMultisig should return an error for missing ZEN public key', async () => {
    const invalidOptions = { ...validTestnetOptions, zenAddressPubKey: null };
    const result = deriveClaimDirectMultisig(invalidOptions);
    console.log('result', result)
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('deriveClaimDirectMultisig should return an error for invalid ETH address', async () => {
    const invalidOptions = { ...validTestnetOptions, baseEthAddress: "12345" };
    const result = deriveClaimDirectMultisig(invalidOptions);
    console.log('result', result)
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('deriveClaimDirectMultisig should return a ZEN address for a valid ETH address', async () => {
    const result = deriveClaimDirectMultisig(validTestnetOptions);
    console.log('result', result);
    expect(typeof result).toBe('object');
    expect(result.redeemScript).toBe(validTestnetOptions.claimDirectMultisigEthereumDerivedRedeemScriptCompressed);
    expect(result.zenMultisigAddress).toBe(validTestnetOptions.claimDirectMultisigEthereumDerivedAddressCompressed);
  });

  test('deriveClaimDirectMultisig should return a ZEN address for a valid ETH address', async () => {
    const result = deriveClaimDirectMultisig(validTestnetOptionsUncompressed);
    console.log('result', result);
    expect(typeof result).toBe('object');
    expect(result.redeemScript).toBe(validTestnetOptionsUncompressed.claimDirectMultisigEthereumDerivedRedeemScriptUncompressed);
    expect(result.zenMultisigAddress).toBe(validTestnetOptionsUncompressed.claimDirectMultisigEthereumDerivedAddressUncompressed);
  });
});
