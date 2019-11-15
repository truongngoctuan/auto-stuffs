const { readFileSync, writeFileSync } = require('fs');

function log(a, b) {
  b ?
  console.log(`ID ${process.pid}: ` + a, b)
  : console.log(`ID ${process.pid}: ` + a);
}

process.on('message', ({ filesChunk, classesMapping, mode }) => {
  for (const file of filesChunk) {
    let data = readFileSync(file, { encoding: 'utf8' });
    for (const [oldClass, newClass] of classesMapping) {
      if (data.includes(mode === 'forward' ? oldClass : newClass)) {
        log(`Convert file ${file} from '${oldClass}' to '${newClass}'`);
        data = mode === 'forward' ?
          data.replace(new RegExp(oldClass, 'g'), newClass) :
          data.replace(new RegExp(newClass, 'g'), oldClass);
        writeFileSync(file, data, { encoding: 'utf8' });
      }
    }
  }

  process.exit(0);
});
