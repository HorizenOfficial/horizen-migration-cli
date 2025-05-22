
import { claimDirectMultisig } from '../bin/claimdirectmultisig';

// The senderAddressPrivKey must maintain a small balance (gas) for the tests to complete. 
describe('claimdirectmultisig.js', () => {
  const validOptions = {
    redeemScript: 
    "0x5121021990511ec5a9e38f9ac64ffd18f84ca62c3f7ee27fae9352791d2b96d57e59502102f65a9490210054080791bae438ced4c341b9e7d840254b0399bf902ea215caa952ae",
    baseEthAddress: "0x8b37D2f92A09a64e3F37B1a1FABF8f18C85804b8",
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

  test('claimDirectMultisig should return a string with one of the succcess values when valid options', async () => {
    const result = await claimDirectMultisig(validOptions);
    console.log('result', result);
    expect(typeof result).toBe('string');
    expect(checkStringContainsAny(result, successes)).toBe(true);
  });
});
