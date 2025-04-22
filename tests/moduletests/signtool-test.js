import { signMessage } from 'zenclaim-signtool'

const signed = signMessage(
    "Test Message",
    "KzFBhL99mZDTdjMhX4jMnybVxkTTACLm6gq9veUjpXcQuXbaAnHf",
)
console.log(signed);