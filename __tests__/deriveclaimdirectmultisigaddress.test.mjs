
import { deriveClaimDirectMultisigAddress } from '../bin/deriveclaimdirectmultisigaddress.js';

describe('deriveclaimdirectmultisigaddress.js', () => {
  const validTestnetOptions = {
    zenAddressPubKey: "02d1edd723d043e62f1c6407b1876126b8b21e688922a0b7c858154befcfd1f8cf",
    baseEthAddress: "0xC2a0780E419d610C7a88800EC74628072f1d4c16",
    claimDirectMultisigEthereumDerivedRedeemScriptCompressed: "512102d1edd723d043e62f1c6407b1876126b8b21e688922a0b7c858154befcfd1f8cf210212124ea744199d7d2875312b37fe9abd04cd68395297341b9fe6493f2b4f8f8352ae",
    claimDirectMultisigEthereumDerivedAddressCompressed: "zrP5ZXf5awakuSE6UbmdT4pBy9CcRByAtx8",
    network: "testnet",
  }

  test('deriveClaimDirectMultisigAddress should return an error for invalid ETH address', async () => {
    const invalidOptions = { ...validTestnetOptions, baseEthAddress: "12345" };
    const result = deriveClaimDirectMultisigAddress(invalidOptions);
    console.log('result', result)
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test.skip('deriveClaimDirectMultisigAddress should return a ZEN address for a valid ETH address', async () => {
    const result = deriveClaimDirectMultisigAddress(validTestnetOptions);
    console.log('result', result);
    expect(typeof result).toBe('object');
    expect(result.redeemScript).toBe(validTestnetOptions.claimDirectMultisigEthereumDerivedRedeemScriptCompressed);
    expect(result.zenMultisigAddress).toBe(validTestnetOptions.claimDirectMultisigEthereumDerivedAddressCompressed);
  });
});
