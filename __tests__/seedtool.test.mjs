
import { deriveAddresses } from '../bin/seedtool.js';

describe('seedtool.js', () => {
  const validOptions = {
    mnemonicPhrase: 'used normal chronic write traffic volume sting oxygen cluster magic era strategy avocado',
    verbose: false,
    numAddresses: 2,
    network: "testnet",
  }
  const derivationPath = "m/44'/121'/5'/0/";
  const expectedDPAddr = { address: 'ztdXJrR18UnBxcBbn32CsotqwDJz87DK4WS' }
  const expectedArray = [
    {
      derivationPath: "m/44'/121'/0'/0/0",
      address: 'ztVPyDhrqYcWXdUZg7EjVQ2yW5mXEirtEH7',
      pubKey: '03aa4b570ebb941e34ee13311b963d55d3c307c933f80a10d94d87eec63f4ede83',
      addressUncompressed: 'ztfPyquDswoUBUBNNWqcPeZrpD7x7QSE9Zt',
      pubKeyUncompressed: '04aa4b570ebb941e34ee13311b963d55d3c307c933f80a10d94d87eec63f4ede834d8b4b2eb5293da33ef525b0ab29f10598927444bf5a1f809f5cd958bec41be7',
      privKeyRaw: '9731a9ada5a46dfb9250123f8150aec097d4572226f4d7c0fc03781a270bd2fc',
      privKeyWIF: 'cSebvnBKGL9CKKj9Tks5faCbPJXHxv8nzrAg32RragJNoLWtgo26'
    },
    {
      derivationPath: "m/44'/121'/0'/0/1",
      address: 'ztbnrP5hcTJsHBJGUKHHVJZp1JMuidPeF7Y',
      pubKey: '020f7c9d87afd715e314e32a857e67db6a62eb833b2d01f9aea5d6827d3a1bc3fb',
      addressUncompressed: 'ztYBYuBCKUxfbxybqJyQWxoZATvPWdmaXuP',
      pubKeyUncompressed: '040f7c9d87afd715e314e32a857e67db6a62eb833b2d01f9aea5d6827d3a1bc3fb51b16de454c6f6268038117aa25e602b27d5f25a4eb446a08eaf8f1654e8d3f6',
      privKeyRaw: 'b8955b4bb6d08b4c8181cef89b2ba13ee25a37bf62c7a4e52b9f08d81d2546bf',
      privKeyWIF: 'cTmWQ9RmmN1Jb1FucFaoE7YTGMhvy3PDQ1wUzo13hLCimWjcXyEw'
    }
  ]

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
  test('deriveAddresses should return an error for invalid network value', async () => {
    const invalidOptions = { ...validOptions, network: 'invalid' };
    const result = await deriveAddresses(invalidOptions);
    expect(result.every(item => item.address.startsWith('zn'))).toBe(true);
  });
  test('deriveAddresses should return address from alternate derivation paths', async () => {
    const compressedOptions = { ...validOptions, derivationPath: "m/44'/121'/5'/0/" };
    const result = await deriveAddresses(compressedOptions);
    expect(result.every(item => item.derivationPath.startsWith(derivationPath))).toBe(true);
    expect.arrayContaining([expect.objectContaining(expectedDPAddr)]);
  });
  test('deriveAddresses should return a string for any stringify value', async () => {
    const invalidOptions = { ...validOptions, stringify: 'true' };
    const result = await deriveAddresses(invalidOptions);
    expect(typeof result).toBe('string');
  });

  test('deriveAddresses should return an object with the correct structure for valid options', async () => {
    const result = await deriveAddresses(validOptions);
    expect(typeof result).toBe('object');
    expect(result.length).toEqual(validOptions.numAddresses);
    expect(result[0].derivationPath).toBe(expectedArray[0].derivationPath);
    expect(result[0].address).toBe(expectedArray[0].address);
    expect(result[0].pubKey).toBe(expectedArray[0].pubKey);
    expect(result[0].addressUncompressed).toBe(expectedArray[0].addressUncompressed);
    expect(result[0].pubKeyUncompressed).toBe(expectedArray[0].pubKeyUncompressed);
    expect(result[0].privKeyRaw).toBe(expectedArray[0].privKeyRaw);
    expect(result[0].privKeyWIF).toBe(expectedArray[0].privKeyWIF);
    expect(result[1].derivationPath).toBe(expectedArray[1].derivationPath);
    expect(result[1].address).toBe(expectedArray[1].address);
    expect(result[1].pubKey).toBe(expectedArray[1].pubKey);
    expect(result[1].addressUncompressed).toBe(expectedArray[1].addressUncompressed);
    expect(result[1].pubKeyUncompressed).toBe(expectedArray[1].pubKeyUncompressed);
    expect(result[1].privKeyRaw).toBe(expectedArray[1].privKeyRaw);
    expect(result[1].privKeyWIF).toBe(expectedArray[1].privKeyWIF);
  });
});
