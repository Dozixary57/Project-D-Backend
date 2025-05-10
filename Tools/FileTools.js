const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');

const getFilePath = {
  Icon: (title) => path.join(process.cwd(), `/MediaStorage/Icons/${title.replace(/_/g, ' ')}.png`),
  Image: (title) => path.join(process.cwd(), `/MediaStorage/Images/${title.replace(/_/g, ' ')}.png`),
  Model: (title) => path.join(process.cwd(), `/MediaStorage/Models/${title.replace(/_/g, ' ')}.glb`),
  Sound: (title) => path.join(process.cwd(), `/MediaStorage/Sounds/${title.replace(/_/g, ' ')}.mp3`),
  Track: (title) => path.join(process.cwd(), `/MediaStorage/Tracks/${title.replace(/_/g, ' ')}.mp3`),
  Avatar: (title) => path.join(process.cwd(), `/MediaStorage/Avatars/${title.replace(/_/g, ' ')}.png`),
};

const getFilesDir = {
  Icons: () => path.join(process.cwd(), '/MediaStorage/Icons'),
  Images: () => path.join(process.cwd(), '/MediaStorage/Images'),
  Models: () => path.join(process.cwd(), '/MediaStorage/Models'),
  Sounds: () => path.join(process.cwd(), '/MediaStorage/Sounds'),
  Tracks: () => path.join(process.cwd(), '/MediaStorage/Tracks'),
  Avatars: () => path.join(process.cwd(), '/MediaStorage/Avatars'),
};

const getFileUrl = (fastify) => ({
  Icon: (title) => `${fastify.config.SERVER}/Icons/${(title).replace(/ /g, '_')}.png`,
  Image: (title) => `${fastify.config.SERVER}/Images/${(title).replace(/ /g, '_')}.png`,
  Model: (title) => `${fastify.config.SERVER}/Models/${(title).replace(/ /g, '_')}.glb`,
  Sound: (title) => `${fastify.config.SERVER}/Sounds/${(title).replace(/ /g, '_')}.mp3`,
  Track: (title) => `${fastify.config.SERVER}/Tracks/${(title).replace(/ /g, '_')}.mp3`,
  Avatars: (title) => `${fastify.config.SERVER}/Avatars/${(title).replace(/ /g, '_')}.png`,
});

async function checkFileExists(filePath) {
  try {
    await fsPromise.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

async function getAnyFileSubtitles(dirPath, title) {
  try {
    const files = await fsPromise.readdir(dirPath);

    const subtitles = files
      .filter(file => file.includes(' - ') && file.startsWith(title))
      .map(file => {
        const parts = file.split(' - ');
        return parts[1] ? parts[1].replace(path.extname(file), '').trim() : null;
      })
      .filter(Boolean);

    return subtitles;
  } catch (err) {
    console.error('Error while reading directory:', err.message);
    return [];
  }
}

function getPrivateKey() {
  return fs.readFileSync(path.join(process.cwd(), 'CryptoKeyPair', 'privateKey.pem'), 'utf8');
}

function getPublicKey() {
  return fs.readFileSync(path.join(process.cwd(), 'CryptoKeyPair', 'publicKey.pem'), 'utf8');
}

module.exports = {
  getFilePath,
  getFilesDir,
  getFileUrl,

  checkFileExists,
  getAnyFileSubtitles,

  getPrivateKey,
  getPublicKey
};