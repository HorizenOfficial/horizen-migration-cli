import { deriveAddresses } from "zenclaim-seedtool"

const addrs = await deriveAddresses({
    mnemonicPhrase: 'used normal chronic write traffic volume sting oxygen cluster magic era strategy avocado',
    verbose: false,
    numAddresses: 2,
    stringify: true,
})
console.log(addrs);