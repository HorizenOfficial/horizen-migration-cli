import { claimZen } from "zenclaim-claimzenaddress"

const addrs = await claimZen({
        zenAddress: 'ztWAzdzHEJ5dGgyy6McEqQiDcHz1tGpRiYk',
        destinationAddress: '0x0Fd343F9a263906bD6AfebfDD4011579979E8aeC',
        signature: 'H+0S58AKRivE+Vd4PAHjcEop4AYobyiY33WYTnrb/DHpG9Zu+e3TXXvBKRgKN4hJbM5V83lW82wvlV/oJkYOTVU=',
        senderAddressPrivKey: 'db32c344d274a8c9f6d969c166efcbfa7bb112333669335b0524bff5647e7395',
        maxFeePerGas: 20000000000,
        maxPriorityFeePerGas: 20000000000,
        network: "testnet",
        verbose: false,
})
console.log(addrs);