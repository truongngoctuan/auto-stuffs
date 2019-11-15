const { existsSync, readFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');
const _ = require("lodash");
const glob = require("glob");

const chunk = (array, chunkSize) => {
  const size = Math.ceil(array.length / chunkSize);
  const result = [];
  while (array.length) {
    result.push(array.splice(0, size));
  }
  return result;
};

const readDir = (dir, fileExtensionFilters, filesList = []) => {
  const files = readdirSync(dir);
  for (let file of files) {
    const filePath = join(dir, file);

    if (existsSync(filePath)) {
      if (statSync(filePath).isDirectory()) {
        filesList = readDir(filePath, fileExtensionFilters, filesList);
      }
      else {
        const idx = _.findIndex(fileExtensionFilters, fileExtension => {
          return file.endsWith("." + fileExtension);
        });
        if (idx !== -1) {
          filesList.push(filePath);
        }
      }
    }
  }
  return filesList;
};


const readDir2 = (dir, globConfig, fileExtensionFilters) => {
  const blobExtension = `*.@(${_.join(fileExtensionFilters, "|")})`;
  const newGlob = globConfig.replace(new RegExp(".*$"), blobExtension);
  console.log("dir  to search on", dir);
  console.log("blob to search on", newGlob);
  const filesList = glob.sync(join(dir, newGlob), {});
  return filesList;
};

const loadCSVFile = () => {
  const csvFilePath = join(__dirname, '..', 'mapping', 'androidx-class-mapping.csv');
  const lines = readFileSync(csvFilePath, { encoding: 'utf8' }).split(/\r?\n/);

  // Remove redundant "Support Library class,Android X class" from array
  lines.shift();

  // last element will always be an empty line so removing it from the array
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  // Some mappings are substrings of other mappings, transform longest mappings first
  lines.sort(function(a, b){
    return b.length - a.length;
  });

  return lines;
};

const getClassesMapping = () => {
  const csv = loadCSVFile();
  const result = [];
  for (let line of csv) {
    const glob = line.split(',')[0];
    const oldValue = line.split(',')[1];
    const newValue = line.split(',')[2];
    result.push([oldValue, newValue]);
  }

  return result;
};

module.exports = {
  getClassesMapping,
  readDir,
  readDir2,
  chunk
};
