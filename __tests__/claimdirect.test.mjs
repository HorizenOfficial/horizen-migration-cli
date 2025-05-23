import { claimDirect } from '../bin/claimdirect.js';

// The senderAddressPrivKey must maintain a small balance (gas) for the tests to complete. 
describe('claimdirect.js', () => {
  const validOptions = {
    baseEthAddress: "0xC2a0780E419d610C7a88800EC74628072f1d4c16",
    senderAddressPrivKey: "db32c344d274a8c9f6d969c166efcbfa7bb112333669335b0524bff5647e7395",
    network: "testnet",
    isTest: true,
    verbose: false,
  }

  // funds can only be claimed once.  If funds, short circuit with Test completed instead of sending tx
  const successes = ["Test completed", "No balance found"]

  const checkStringContainsAny = (str, subs) => {
    return subs.some(sub => str.includes(sub));
  };

  // error returns {error: message}. 
  // testing returns string, one of the success messsages
  // tx.hash (string) is returned when not testing
  test('claimDirect should return an error for missing baseEthAddress', async () => {
    const invalidOptions = { ...validOptions, baseEthAddress: null };
    const result = await claimDirect(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirect should return an error for missing senderAddressPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: null };
    const result = await claimDirect(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });


  test('claimDirect should return an error for invalid baseEthAddress', async () => {
    const invalidOptions = { ...validOptions, baseEthAddress: "12345" };
    const result = await claimDirect(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirect should return an error for invalid senderAddresPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: "12345" };
    const result = await claimDirect(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirect should return an error for incorrect network value', async () => {
    const invalidOptions = { ...validOptions, network: 'invalid' };
    const result = await claimDirect(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimDirect should return a string with one of the succcess values when valid options', async () => {
    const result = await claimDirect(validOptions);
    console.log("Test result:", result)
    expect(typeof result).toBe('string');
    expect(checkStringContainsAny(result, successes)).toBe(true);
  });
});
