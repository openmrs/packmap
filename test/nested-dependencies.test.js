const packmap = require("packmap");
const fsMock = require("fs-extra");

jest.mock("../lib/require-resolve.js");

describe(`nested dependencies`, () => {
  it(`includes nested dependencies in the import map and dist directory`, () => {
    fsMock.mockMainPackageJson({
      version: "1.0.0",
      dependencies: {
        a: "2.0.0"
      }
    });

    fsMock.mockDepPackageJson("a", {
      version: "2.0.0",
      main: "a.js",
      dependencies: {
        b: "3.0.0"
      },
      devDependencies: {
        c: "4.0.0"
      }
    });

    fsMock.mockDepPackageJson("b", {
      version: "3.0.0",
      main: "b.js"
    });

    return packmap({
      outdir: "dist",
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {
          a: "/dist/a@2.0.0/a.js",
          b: "/dist/b@3.0.0/b.js"
        }
      });
      expect(fsMock.getOutputModuleDir("a")).toBe("/dist/a@2.0.0");
      expect(fsMock.getOutputModuleDir("b")).toBe("/dist/b@3.0.0");

      expect(() => {
        fsMock.getOutputModuleDir("c");
      }).toThrow();
    });
  });
});
