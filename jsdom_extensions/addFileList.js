const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const { JSDOM } = require('jsdom');

const { File, FileList } = new JSDOM().window;

const createFile = async (filePath) => {
  const { mtimeMs: lastModified } = fs.statSync(filePath);

  const file = await new Promise((resolve, reject) => {
    let f = null;
    f = new File([fs.readFile(filePath)], path.basename(filePath), {
      lastModified,
      type: mime.lookup(filePath) || '',
    });

    if (f) resolve(f);
  });
  return file;
};

function addFileList(input, filePaths) {
  if (typeof filePaths === 'string') filePaths = [filePaths];
  else if (!Array.isArray(filePaths)) {
    throw new Error('filePaths needs to be a file path string or an Array of file path strings');
  }

  const fileList = filePaths.map(fp => createFile(fp));
  fileList.__proto__ = Object.create(FileList.prototype);

  Object.defineProperty(input, 'files', {
    value: fileList,
    writable: false,
  });

  return input;
}

module.exports = {
  addFileList,
  createFile,
};
