const fs = require('fs').promises;
const AdmZip = require('adm-zip');

/**
 * Generates zip files from packaged driver files
 */
const buildZipFiles = async () => {
  const files = await fs.readdir('.');

  const driverFiles = files.filter(fileName =>
    /^plumadriver-(linux|macos|win)(.exe)*$/.test(fileName),
  );

  const promises = driverFiles.map(async fileName => {
    const os = fileName.split('-')[1].replace('.exe', '');
    const zip = new AdmZip();
    const data = await fs.readFile(fileName);
    zip.addFile(`${os === 'win' ? 'plumadriver.exe' : 'plumadriver'}`, data);

    let zipFileName;

    switch (os) {
      case 'win':
        zipFileName = 'plumadriver-win64.zip';
        break;
      case 'linux':
        zipFileName = 'plumadriver-linux64.zip';
        break;
      case 'macos':
        zipFileName = 'plumadriver-macos.zip';
    }

    zip.writeZip(zipFileName);
  });

  await Promise.all(promises);
};

/**
 * Removes driver files after they have been zipped
 */
const removeLeftOverDriverFiles = async () => {
  const files = await fs.readdir('.');
  const driverFiles = files.filter(
    fileName => /^plumadriver-/.test(fileName) && !fileName.includes('.zip'),
  );
  await Promise.all(driverFiles.map(driverFile => fs.unlink(driverFile)));
};

buildZipFiles()
  .then(removeLeftOverDriverFiles)
  .catch(console.log);
