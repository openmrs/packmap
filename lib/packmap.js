const fs = require("fs-extra");
const path = require("path");
const sortObject = require("sort-object-keys");
const requireResolve = require("./require-resolve.js");

module.exports = async function packmap(opts) {
  let cwd = opts.cwd || process.cwd();
  if (!path.isAbsolute(cwd)) {
    cwd = path.resolve(process.cwd(), cwd);
  }
  const depTree = {};
  const log = opts.log || function() {};
  const normalizedOutdir = path.normalize(opts.outdir);
  await fs.remove(normalizedOutdir);
  await fs.ensureDir(normalizedOutdir);
  const packageJsonPath = path.resolve(cwd, opts.package);
  const packageJson = readPackageJson(packageJsonPath);
  const importMap = await traversePackage(packageJson);

  if (opts.verbose) {
    log(`Processed dependency tree`);
    log(depTree);
  }

  if (opts.overrideMap) {
    const overridingMapPath = path.resolve(cwd, opts.overrideMap);
    if (await fs.pathExists(overridingMapPath)) {
      const overridingMap = require(overridingMapPath);
      Object.assign(importMap.imports, overridingMap.imports);
      log(`Generated import-map overridden by "${opts.overrideMap}"`);
    } else {
      throw new Error(
        `Unable to find override import-map file at "${overridingMapPath}"`
      );
    }
  }

  importMap.imports = sortObject(importMap.imports);
  await fs.appendFile(
    path.resolve(cwd, opts.outdir, "import-map.json"),
    JSON.stringify(importMap, null, 2)
  );

  function traversePackage(packageJson, importMap = { imports: {} }) {
    const dependencies = Object.keys(packageJson.dependencies || {});
    depTree[packageJson.name] = dependencies;
    return Promise.all(
      dependencies.map(dependency => {
        if (dependency.startsWith("@types/")) {
          return;
        }
        if (opts.verbose) {
          log(`processing dependency ${dependency}`);
        }

        let overrides = {};
        try {
          overrides = require(`./package-json-overrides/${dependency}.json`);
        } catch (err) {
          // do nothing
        }

        const packageDir = path.dirname(
          requireResolve(dependency + "/package.json", {
            paths: [cwd]
          })
        );
        const depPackageJson = readPackageJson(
          path.resolve(packageDir, "package.json")
        );
        Object.assign(depPackageJson, overrides);
        const libDir =
          (depPackageJson.directories && depPackageJson.directories.lib) || ".";
        const dirToCopy = path.resolve(packageDir, libDir);
        const destBaseDir = path.resolve(
          cwd,
          opts.outdir,
          `${dependency}@${depPackageJson.version}`
        );
        const destDir = path.resolve(destBaseDir, libDir);
        const mainFile = path
          .normalize(depPackageJson.main || "index.js")
          .replace(path.sep, "/");
        const importMapUrl = `${opts.baseUrl || ""}/${
          opts.outdir
        }/${dependency}@${depPackageJson.version}/${mainFile}`;
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

function readPackageJson(path) {
  let file;
  try {
    file = fs.readFileSync(path);
  } catch {
    throw Error(`File does not exist: '${path}'`);
  }
  try {
    return JSON.parse(file);
  } catch {
    throw Error(
      `File is not valid json (expected a package.json file): '${path}'`
    );
  }
}
