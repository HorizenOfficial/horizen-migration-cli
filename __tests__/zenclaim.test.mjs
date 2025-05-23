
import { claimZen } from '../bin/claimzenaddress.js';

// The senderAddressPrivKey must maintain a small balance (gas) for the tests to complete. 
describe('claimzenaddress.js', () => {
  const validOptions = {
    zenAddress: "ztkBJxYRcZ4TqL6Ggj8DZAzzZRMHV26j5ri",
    destinationAddress: "0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC",
    signature: "H4Z2sV/Ri3nfbX2zZSAfI0C8pBPTVEaBqqtMxe+whXnjAKuY3GjqVvuYkvj3vFOtbNdS4aIOL19l5B+xkQw43Fc=",
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
  test('claimZen should return an error for missing zenAddress', async () => {
    const invalidOptions = { ...validOptions, zenAddress: null };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimZen should return an error for missing destinationAddress', async () => {
    const invalidOptions = { ...validOptions, destinationAddress: null };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimZen should return an error for missing signature', async () => {
    const invalidOptions = { ...validOptions, signature: null };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimZen should return an error for missing senderAddressPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: null };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });


  test('claimZen should return an error for invalid zenddresses', async () => {
    const invalidOptions = { ...validOptions, zenAddress: "12345" };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimZen should return an error for invalid destination', async () => {
    const invalidOptions = { ...validOptions, destinationAddress: "12345" };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimZen should return an error for invalid signature', async () => {
    const invalidOptions = { ...validOptions, signature: "HOWDY" };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimZen should return an error for invalid senderAddresPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: "12345" };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimZen should return an error for incorrect network value', async () => {
    const invalidOptions = { ...validOptions, network: 'invalid' };
    const result = await claimZen(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimZen should return a string with one of the succcess values when valid options', async () => {
    const result = await claimZen(validOptions);
    console.log("Test result:", result)
    expect(typeof result).toBe('string');
    expect(checkStringContainsAny(result, successes)).toBe(true);
  });
});
