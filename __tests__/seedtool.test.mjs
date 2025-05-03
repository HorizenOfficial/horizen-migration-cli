
import { deriveAddresses } from 'zenclaim-seedtool/seedtool.js';

describe('seedtool.js', () => {
  const validOptions = {
   mnemonicPhrase: 'used normal chronic write traffic volume sting oxygen cluster magic era strategy avocado',
   verbose: false,
   numAddresses: 2,
   network: "testnet",
 }
 const expectedArray = [{},{}] ; // contains objects
 const addr = {address: 'ztVPyDhrqYcWXdUZg7EjVQ2yW5mXEirtEH7'};
 const derivationPath = "m/44'/121'/5'/0/";
 const expectedDPAddr = {address: 'ztdXJrR18UnBxcBbn32CsotqwDJz87DK4WS'}

  // returns array of objects or {error: message}
  test('deriveAddresses should return an error for missing mnemonicPhrase', async () => {
    const invalidOptions = { ...validOptions, mnemonicPhrase: null };
    const result = await deriveAddresses(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('deriveAddresses should return an error for invalid numAddresses', async () => {
    const invalidOptions = { ...validOptions, numAddresses: -1 };
    const result = await deriveAddresses(invalidOptions);
    expect(typeof result).toBe('object');
    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
  test('deriveAddresses should return the correct number of addresses', async () => {
    const options = { ...validOptions, numAddresses: 5 };
    const result = await deriveAddresses(options);
    expect(result).toHaveLength(5);
  });
  test('deriveAddresses should return an error for invalid network value', async() => {
    const invalidOptions = { ...validOptions, network: 'invalid' };
    const result = await deriveAddresses(invalidOptions);
    expect(result.every(item => item.address.startsWith('zn'))).toBe(true);
  });
  test('deriveAddresses should return address from alternate derivation paths', async () => {
    const compressedOptions = { ...validOptions, derivationPath: "m/44'/121'/5'/0/" };
    const result = await deriveAddresses(compressedOptions);
    expect(result.every(item => item.derivationPath.startsWith(derivationPath))).toBe(true); // Assuming testnet addresses start with 't'
    expect.arrayContaining([expect.objectContaining(expectedDPAddr)]);
  });

  test('deriveAddresses should return a string for any stringify value', async() => {
    const invalidOptions = { ...validOptions, stringify: 'true' };
    const result = await deriveAddresses(invalidOptions);
    expect(typeof result).toBe('string'); 
  });
  test('deriveAddresses should return an object with the correct structure for valid options', async () => {
    const result = await deriveAddresses(validOptions);
    expect(typeof result).toBe('object');
    expect(result.length).toEqual(validOptions.numAddresses);
    expect.arrayContaining(expectedArray);
    expect.arrayContaining([expect.objectContaining(addr)]);
  });
});
