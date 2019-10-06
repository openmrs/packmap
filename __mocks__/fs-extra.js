const fs = require("fs");
const path = require("path");

exports.remove = jest.fn();
exports.ensureDir = jest.fn();
exports.appendFile = jest.fn();
exports.copy = jest.fn();

let mockedFiles = {};
exports.readFileSync = jest.fn();

exports.mockMainPackageJson = object => {
  const filePath = path.resolve("/", "package.json");
  mockedFiles[filePath] = JSON.stringify(object, null, 2);
};

exports.mockDepPackageJson = (depName, object) => {
  mockedFiles[`/node_modules/${depName}/package.json`] = JSON.stringify(
    object,
    null,
    2
  );
};

exports.getOutputImportMap = () => {
  const result = exports.appendFile.mock.calls.find(mockCall =>
    mockCall[0].endsWith("import-map.json")
  );
  if (!result) {
    throw Error(`No import-map.json file was written by packmap!`);
  }

  return JSON.parse(result[1]);
};

exports.getOutputModuleDir = moduleName => {
  const result = exports.copy.mock.calls.find(mockCall =>
    mockCall[0].startsWith(`/node_modules/${moduleName}`)
  );
  if (!result) {
    throw Error(`No output directory was created for module '${moduleName}'`);
  }
  return result[1];
};

beforeEach(() => {
  exports.remove.mockReset();
  exports.ensureDir.mockReset();

  exports.appendFile.mockReset();

  exports.readFileSync.mockReset();
  exports.readFileSync.mockImplementation(path => {
    if (fs.existsSync(path)) {
      return fs.readFileSync(path);
    } else if (mockedFiles[path]) {
      return mockedFiles[path];
    } else {
      throw Error(`File not mocked for tests - ${path}`);
    }
  });

  exports.copy.mockReset();

  mockedFiles = {};
});
