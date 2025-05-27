
import { claimMultisig } from '../bin/claimmultisigaddress.js';

// The senderAddressPrivKey must maintain a small balance (gas) for the tests to complete. 
describe('claimmultisigaddress.js', () => {
  const validOptions = {
    multisigAddress: "zrDdMQS7nbn5d3o3Ufk1cQnjZPAxJEMBJ36",
    destinationAddress: "0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC",
    redeemScript: 
    "542103425666102bdb6d9717ad54c348e1bfd03081da464abbd5ad5c3242a50fc5cfbc21034acdc74927ba7883a2f204e1cb968d16e1353f6be863061fcec1ace44c47a07c2103d2d0e62a31ea320df006cce4556388db7ea64dfb740024d1e047758475cc23dc2102245f8133558709cbb10d073bf0670378685cc710d431fa50970b3fac946c0f8821022d70ccaf7d5c672c14c1d069d2b1b774dfba70b4a212d913d85e436abdec2efc21032260e7b8b097376153ed7df122f3def3109c433c5c1dcb0c44609589c45e99202103958e41915484c86760b4e901bd8dea143ed983bee7420e62ae6b603c43df6fc657ae",
    signatures:"[\"IBYYDgRuV00RCclnSMWAeZVk3MdebYjV472l3XlDxXfeI3L6VxbLsSbBuGLdj2RngZP3NSA3ZEn9uTnUhZ7GbZ4=\",\"H6Isb3oLT30VeF3aWaVRQ9U8Uw6iSPMkoREg5meru2LcOintBZWk0PLLCqryTd3sdmTjNyYVq/GUDvp8u3e7r20=\",\"INCn/DANbHIyA4slSBkFx8NZc9K2PUAFyFcuOObiHVVKIRpKDEDtjBxwZsq9R91i1QS5Bjtsl87dcJoEndtJTYM=\",\"H4pAArt+P+MSCNKnUH2Oq1yVp/K9M29IvNpFxDFA8wLmB+iaXz6z7l0dcvUc5F6yEF9TLIXqHSaxuCf7fGhP1Vc=\"]",
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
  test('claimMultisig should return an error for missing multisigAddress', async () => {
    const invalidOptions = { ...validOptions, multisigAddress: null };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for missing destinationAddress', async () => {
    const invalidOptions = { ...validOptions, destinationAddress: null };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for missing signatures', async () => {
    const invalidOptions = { ...validOptions, signatures: null };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for missing senderAddressPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: null };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for missing redeemScript', async () => {
    const invalidOptions = { ...validOptions, redeemScript: null };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });


  test('claimMultisig should return an error for invalid zenMultisigddresses', async () => {
    const invalidOptions = { ...validOptions, multisigAddress: "12345" };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for invalid destination', async () => {
    const invalidOptions = { ...validOptions, destinationAddress: "12345" };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.stringContaining('Not a valid destinationAddress.') })
    );
  });
  test('claimMultisig should return an error for invalid signatures', async () => {
    const invalidOptions = { ...validOptions, signatures: "[HOWDY]" };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for invalid senderAddressPrivKey', async () => {
    const invalidOptions = { ...validOptions, senderAddressPrivKey: "12345" };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('claimMultisig should return an error for invalid redeemScript', async () => {
    const invalidOptions = { ...validOptions, redeemScript: "12345" };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimMultisig should return an error for incorrect network value', async () => {
    const invalidOptions = { ...validOptions, network: 'incorrect' };
    const result = await claimMultisig(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('claimMultisig should return a string with one of the succcess values when valid options', async () => {
    const result = await claimMultisig(validOptions);
    console.log('result', result);
    expect(typeof result).toBe('string');
    expect(checkStringContainsAny(result, successes)).toBe(true);
  });
});
