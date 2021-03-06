const { fork, spawn } = require("child_process");
const { join } = require("path");
const { getClassesMapping, readDir2, chunk } = require("./src/utils");
const _ = require("lodash");

const cpus = require("os").cpus().length;
const arg = process.argv.slice(2)[0];
const mode = arg && (arg === "reverse" || arg === "-r") ? "reverse" : "forward";

const configs = [
  {
    SEARCH_DIR: "../../data/project-config",
    fileExtensionFilters: ["json", "js"],
    dirGlob: "*.*"
  }
];

function exec(config) {
  const classesMapping = getClassesMapping();
  const files = readDir2(
    config.SEARCH_DIR,
    config.dirGlob,
    config.fileExtensionFilters
  );

  console.log(files);
  console.log(
    `Jetifier found ${files.length} file(s) to ${mode}-jetify. Using ${cpus} workers...`
  );

  for (const filesChunk of chunk(files, cpus)) {
    const worker = fork(join(__dirname, "src", "worker.js"));
    worker.send({ filesChunk, classesMapping, mode });
  }
}

_.each(configs, config => {
  exec(config);
})
