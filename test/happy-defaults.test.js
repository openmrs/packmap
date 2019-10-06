const packmap = require("packmap");
const fsMock = require("fs-extra");

jest.mock("../lib/require-resolve.js");

describe(`happy defaults`, () => {
  it(`creates an import map and dist directory`, () => {
    fsMock.mockMainPackageJson(__dirname, {
      version: "1.2.3",
      dependencies: {
        "please-be-in-import-map": "4.5.6",
        "another-thing": "0.0.0"
      },
      devDependencies: {
        "please-ignore": "7.8.9"
      }
    });

    fsMock.mockDepPackageJson("please-be-in-import-map", {
      version: "4.5.6",
      main: "the-main-file.js"
    });

    fsMock.mockDepPackageJson("another-thing", {
      version: "0.0.0"
      // no "main" field in the package.json results in defaulting to index.js
    });

    return packmap({
      outdir: "dist",
      package: "package.json",
      cwd: __dirname
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {
          "please-be-in-import-map":
            "/dist/please-be-in-import-map@4.5.6/the-main-file.js",
          "another-thing": "/dist/another-thing@0.0.0/index.js"
        }
      });
      expect(
        fsMock.getOutputModuleDir(__dirname, "please-be-in-import-map")
      ).toBe("/dist/please-be-in-import-map@4.5.6");
      expect(fsMock.getOutputModuleDir(__dirname, "another-thing")).toBe(
        "/dist/another-thing@0.0.0"
      );
    });
  });
});
