const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Logger = require('@Tools/Logger')

function generateKeyPair() {
  if (!fs.existsSync(path.join(process.cwd(), 'CryptoKeyPair', 'publicKey.pem')) || !fs.existsSync(path.join(process.cwd(), 'CryptoKeyPair', 'privateKey.pem'))) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });

    if (!fs.existsSync(path.join(process.cwd(), 'CryptoKeyPair'))) {
      fs.mkdirSync(path.join(process.cwd(), 'CryptoKeyPair'));
    }

    fs.writeFileSync(path.join(process.cwd(), 'CryptoKeyPair', 'publicKey.pem'), publicKey)
    fs.writeFileSync(path.join(process.cwd(), 'CryptoKeyPair', 'privateKey.pem'), privateKey)

    Logger.Server.Info('A key pair has been generated.');
  } else {
    Logger.Server.Info('The key pair exists.');
  }
}

module.exports = generateKeyPair