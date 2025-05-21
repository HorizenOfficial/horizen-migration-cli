
import { claimDirectMultisig } from '../bin/claimdirectmultisig';

// The senderAddressPrivKey must maintain a small balance (gas) for the tests to complete. 
describe('claimdirectmultisig.js', () => {
  const validOptions = {
    redeemScript: 
    "52210233b8f85c9ee02ed912cd0c0a522221e5b6755c895074dc6b79b29dea611c48052103422bf5cfd49a1d16a89a0b73e2875710879c3736605d0835bf3b911b288c847221031522dcbf3f51338a41f934bf1223b38256e1c31ead1c8c0903328e42d2a647e953ae",
    baseEthAddress: "",
    senderAddressPrivKey: 'db32c344d274a8c9f6d969c166efcbfa7bb112333669335b0524bff5647e7395',
    network: "testnet",
    isTest: true,
    verbose: false,
  }

  // funds can only be claimed once.  If funds, short circuit with Test completed instead of sending tx
  const successes = ["Test completed", "No balance found"]

  const checkStringContainsAny = (str, subs) => {
    return subs.some(sub => str.includes(sub));
  };

  // error returns {error: message}. testing returns string, one of the success messsages
  // tx.hash (string) is returned when not testing
  test('claimDirectMultisig should return an error for missing redeemScript', async () => {
    const invalidOptions = { ...validOptions, redeemScript: null };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirectMultisig should return an error for missing baseEthAddress', async () => {
    const invalidOptions = { ...validOptions, baseEthAddress: null };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirectMultisig should return an error for missing senderAddressPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: null };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });


  test('claimDirectMultisig should return an error for invalid redeemScript', async () => {
    const invalidOptions = { ...validOptions, redeemScript: "12345" };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirectMultisig should return an error for invalid baseEthAddress', async () => {
    const invalidOptions = { ...validOptions, baseEthAddress: "12345" };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirectMultisig should return an error for invalid senderAddressPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: "12345" };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirectMultisig should return an error for incorrect network value', async () => {
    const invalidOptions = { ...validOptions, network: 'incorrect' };
    const result = await claimDirectMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test.skip('claimDirectMultisig should return a string with one of the succcess values when valid options', async () => {
    const result = await claimDirectMultisig(validOptions);
    expect(typeof result).toBe('string');
    expect(checkStringContainsAny(result, successes)).toBe(true);
  });
});
