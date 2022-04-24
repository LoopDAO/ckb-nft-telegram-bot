const NodeRsa = require('node-rsa')
const { Buffer } = require('buffer')
const { generateFlashsignerAddress } = require('@nervina-labs/flashsigner')

exports.validateSignature = (message, signature) => {
  const response = {
    message,
    // 如果是从 response url 直接解析 signature 则需要取前 520 个字符
    // 如果从 flashsigner-sdk 得到的参数则可以直接传入验签
    signature: signature.slice(520),
    pubkey: signature.slice(0, 520)
  }
  const key = new NodeRsa()
  const buf = Buffer.from(response.pubkey, 'hex')
  const e = buf.slice(0, 4).reverse()
  const n = buf.slice(4).reverse()
  key.importKey({ e, n }, 'components-public')
  key.setOptions({ signingScheme: 'pkcs1-sha256' })
  const isValid = key.verify(
    Buffer.from(response.message),
    Buffer.from(response.signature, 'hex')
  )
  return isValid
}

exports.getWalletAddress = (signature) => {
  const publicKey = signature.slice(0, 520)
  const address = generateFlashsignerAddress(publicKey)
  return address
}
