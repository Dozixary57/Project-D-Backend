const fs = require('fs').promises;
const path = require('path');

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

async function getAnyFileSubtitles(dirPath, title) {
  try {
    const files = await fs.readdir(dirPath);

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

module.exports = {
  checkFileExists,
  getAnyFileSubtitles
};