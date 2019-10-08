const packmap = require("packmap");
const fsMock = require("fs-extra");

jest.mock("../lib/require-resolve.js");

describe(`output directory`, () => {
  it(`allows you to specify a directory`, () => {
    fsMock.mockMainPackageJson({
      dependencies: {
        a: "1.0.0"
      }
    });

    fsMock.mockDepPackageJson("a", {
      version: "1.0.0"
    });

    return packmap({
      outdir: "build", // different than dist
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {
          a: "/build/a@1.0.0/index.js"
        }
      });
      expect(fsMock.getOutputModuleDir("a")).toBe("/build/a@1.0.0");
    });
  });

  it(`allows you to specify a nested directory that is created recursively`, () => {
    fsMock.mockMainPackageJson({
      dependencies: {
        a: "1.0.0"
      }
    });

    fsMock.mockDepPackageJson("a", {
      version: "1.0.0"
    });

    return packmap({
      outdir: "some/nested/dir",
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {
          a: "/some/nested/dir/a@1.0.0/index.js"
        }
      });
      expect(fsMock.getOutputModuleDir("a")).toBe("/some/nested/dir/a@1.0.0");
    });
  });
});
