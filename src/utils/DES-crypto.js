import cryptoJs from 'crypto-js'
const _encryptKey = 'BingBlog'

export default {
  // 加密函數
  encrypt(word) {
    const keyHex = cryptoJs.enc.Utf8.parse(_encryptKey)
    let enc = ''
    if (typeof word === 'string') {
      enc = cryptoJs.DES.encrypt(word, keyHex, {
        // iv: iv
        mode: cryptoJs.mode.ECB,
        padding: cryptoJs.pad.Pkcs7
      })
    } else if (typeof word === 'object') {
      const data = JSON.stringify(word)
      enc = cryptoJs.DES.encrypt(data, keyHex, {
        // iv: iv
        mode: cryptoJs.mode.ECB,
        padding: cryptoJs.pad.Pkcs7
      })
    }
    return enc.ciphertext.toString()
  },
  // 解密函數
  decrypt(word) {
    // console.log('传入的密文：', word)

    const key = cryptoJs.enc.Utf8.parse(_encryptKey)
    const dec = cryptoJs.DES.decrypt(
      {
        ciphertext: cryptoJs.enc.Hex.parse(word)
      },
      key,
      {
        // vi: vi
        mode: cryptoJs.mode.ECB,
        padding: cryptoJs.pad.Pkcs7
      }
    )
    // console.log(dec.toString(cryptoJs.enc.Utf8))
    return dec.toString(cryptoJs.enc.Utf8)
  }
}
