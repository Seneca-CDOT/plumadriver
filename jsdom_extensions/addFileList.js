const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const { JSDOM } = require('jsdom');
const { File, FileList } = (new JSDOM()).window;

function createFile(filePath) {
  const { mtimeMs: lastModified } = fs.statSync(filePath);

  return new File(
    [fs.readFileSync(filePath)],
    path.basename(filePath),
    {
      lastModified,
      type: mime.lookup(filePath) || '',
    },
  );
}

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
