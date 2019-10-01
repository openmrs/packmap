const fs = require("fs-extra");
const path = require("path");
const sortObject = require("sort-object-keys");

module.exports = async function packmap(opts) {
  const normalizedOutdir = path.normalize(opts.outdir);
  await fs.remove(normalizedOutdir);
  await fs.ensureDir(normalizedOutdir);
  const packageJsonPath = path.resolve(process.cwd(), opts.package);
  const packageJson = require(packageJsonPath);
  const importMap = await traversePackage(packageJson);
  importMap.imports = sortObject(importMap.imports);
  await fs.appendFile(
    path.resolve(opts.outdir, "import-map.json"),
    JSON.stringify(importMap, null, 2)
  );

  function traversePackage(packageJson, importMap = { imports: {} }) {
    const dependencies = Object.keys(packageJson.dependencies || {});
    return Promise.all(
      dependencies.map(dependency => {
        if (dependency.startsWith("@types/")) {
          return;
        }
        console.log(`processing dependency ${dependency}`);

        let overrides = {};
        try {
          overrides = require(`./package-json-overrides/${dependency}.json`);
        } catch (err) {
          // do nothing
        }

        const packageDir = path.dirname(
          require.resolve(dependency + "/package.json", {
            paths: [process.cwd()]
          })
        );
        const depPackageJson = require(path.resolve(
          packageDir,
          "package.json"
        ));
        Object.assign(depPackageJson, overrides);
        const libDir =
          (depPackageJson.directories && depPackageJson.directories.lib) || ".";
        const dirToCopy = path.resolve(packageDir, libDir);
        const destBaseDir = path.resolve(
          opts.outdir,
          `${dependency}@${depPackageJson.version}`
        );
        const destDir = path.resolve(destBaseDir, libDir);
        const mainFile = path
          .normalize(depPackageJson.main || "index.js")
          .replace(path.sep, "/");
        const importMapUrl = `/${opts.outdir}/${dependency}@${depPackageJson.version}/${mainFile}`;
        let alreadyCopied = false;
        if (importMap.imports[dependency]) {
          if (importMap.imports[dependency] === importMapUrl) {
            alreadyCopied = true;
          } else {
            throw Error(
              `Multiple versions detected for module '${dependency}'`
            );
          }
        }
        if (
          dependency !== "systemjs" &&
          dependency !== "import-map-overrides"
        ) {
          importMap.imports[dependency] = importMapUrl;
        }
        const copyPromise = alreadyCopied
          ? Promise.resolve()
          : fs.copy(dirToCopy, destDir);
        return Promise.all([
          copyPromise,
          traversePackage(depPackageJson, importMap)
        ]);
      })
    ).then(() => importMap);
  }
};
