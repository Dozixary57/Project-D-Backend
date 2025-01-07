const fs = require('fs').promises;

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { checkFileExists };