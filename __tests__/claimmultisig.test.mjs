import { claimMultisig } from "../bin/claimmultisigaddress.js";

// The senderAddressPrivKey must maintain a small balance (gas) for the tests to complete.
describe("claimmultisigaddress.js", () => {
  const validOptions = {
    multisigAddress: "zr6Yt44Q382kXpPHzG8qHT5tzjABpJ1PYNL",
    destinationAddress: "0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC",
    redeemScript:
      "5421025f0d40db0b400c5c39af6bd27f41d554f91ae1d52b8fc3d4918ab4e144261943210219686ffccd8be87941ae5bf44c62bd9b85739803822456344bf5259ce18a0be021037727904decdaf983b4ae576e1051ad8aaa1f64ad28a3a704f1f34e501ac2794b2103c8ae06e44d7351e01596a18033703e1097bbb06753e3c3db7707140eee7c96f754ae",
    signatures:
      '["IEHJk1kh7deIH66uqyy2eAuxP7XMmiMuCBHJNosMFFevcMN5/b8w9YZHWfLCaw+hk7LsceMeFlGikjGi9GWNuy0=","H5LOCo9uq81chWdlM34Xu2Nnq38zwfxuyfCDQgB/Nmvob5+tfBA1DZeflr2vy/bzif+0T6BrJQTMGBYFlZr8/WY=","IKNAmsOQSX5ShzUmb5e+SVn5KlY3poQDFQxO6E5CqejHSAIT6UaFDXDMJ5cJwPbgLO8KaQe9NKJKBMXejjzKvXc=","H1V566Pkr4zn/QbtOFILT0y4M7MztKtQvQeXYD1tKvlQJl3zifBW2B0uDuIhmthrnAvvaH9zc0khicGTiPG2Py4="]',
    senderAddressPrivKey:
      "db32c344d274a8c9f6d969c166efcbfa7bb112333669335b0524bff5647e7395",
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
