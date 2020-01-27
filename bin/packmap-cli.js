#!/usr/bin/env node
const program = require("commander");
const version = require("../package.json").version;
const packmap = require("../lib/packmap.js");

program.version(version);
program.option("-o, --outdir <outdir>", "change the output directory", "dist");
program.option(
  "--base-url <baseUrl>",
  "base url to use as prefix when generating the import map"
);
program.option(
  "-p, --package <package>",
  "path to package.json file",
  "package.json"
);
program.option(
  "--override-map <overrideMap>",
  "path to importmap which overrides the generated map"
);
program.option(
  "--exclude-packages <excludePackages>",
  "path to a file containing npm packages to skip when pack-mapping"
);
program.option(
  "--cwd <cwd>",
  "override the path to use as the current working directory"
);
program.option("-v, --verbose", "print lots of stuff");

program.parse(process.argv);

program.log = (...args) => console.log(...args);

const initialTime = new Date().getTime();
packmap(program)
  .then(() => {
    const totalTime = new Date().getTime() - initialTime;
    console.log(
      `packmap finished in ${totalTime}ms. Check the ${program.outdir} directory.`
    );
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
