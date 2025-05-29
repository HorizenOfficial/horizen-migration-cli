#!/usr/bin/env node

import { verifySignedMessage, checkHelp, listArgs, run, help } from "../src/utils/claimutils.js";
import 'colors';
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const version = packageJson.version;

// HELP
const usage = `${'Usage: npx zenclaim-verifymessage --argument="" --argument="" ... '.cyan}
arguments:
 --message="" (mandatory) 
 --zenAddress="" (mandatory)
 --signature="" (mandatory)
 --help  display this help
 --verbose display arguments received
${'Short forms of arguments'.cyan} 
  -ms="" -za="" -sg="" -nt="" -h -v 
`;

// Allowed arguments
const long = ['--message', '--zenAddress', '--signature', '--help', '--verbose'];
const short = ['-ms', '-za', '-sg', '-h', '-v'];
const allowed = long.concat(short);

// Function to parse arguments
function parseArguments(args) {
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const [key, val] = args[i].split('=');
    if (allowed.indexOf(key) === -1) {
      console.error(`${key} is not valid. ${help}`.red);
      process.exit(1);
    }
    if (key === '-ms' || key === '--message') { options.message = val; continue; }
    if (key === '-za' || key === '--zenAddress') { options.zenAddress = val; continue; }
    if (key === '-sg' || key === '--signature') { options.signature = val; continue; }
    if (key === '-v' || key === '--verbose') { options.verbose = true; continue; }
  }

  if (options.verbose) console.log('zenclaim-verifymessage CLI'.green, version.yellow, 'by The Horizen Foundation'.grey);

  if (!options.message || !options.zenAddress || !options.signature) {
    console.error('message, zenAddress, and signature are all required'.red);
    process.exit(1);
  }

  return options;
}

// Function to verify the message
function verifyMessage(options) {
  if (options.verbose)  console.log("options=", options);

  try {
    // message , zenAddress, signature
    if (!options.message) throw new Error('Missing message');
    if (!options.zenAddress) throw new Error('Missing zenAddress');
    if (!options.signature) throw new Error('Missing signature');

    const valid = verifySignedMessage(options.message, options.zenAddress, options.signature);
    return valid;
  } catch (error) {
    return { error: error.message || 'Unable to verify the signature'.red };
  }
}

// Main function for CLI
async function main(args) {
  checkHelp(args, usage);

  const options = parseArguments(args);
  listArgs(options);

  const result = verifyMessage(options);
  if (result?.error) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(result);
}

// Export the verifyMessage function for use as a module
export { verifyMessage };

// If the script is run directly, execute the main function
run(process.argv, 'verifymessage', main);
