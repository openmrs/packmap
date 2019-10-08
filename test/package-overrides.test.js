const packmap = require("packmap");
const fsMock = require("fs-extra");

jest.mock("../lib/require-resolve.js");

describe(`overrides the package.json for some dependencies`, () => {
  it(`overrides react package.json properly`, () => {
    fsMock.mockMainPackageJson({
      dependencies: {
        react: "16.9.0"
      }
    });

    fsMock.mockDepPackageJson("react", {
      version: "16.9.0"
    });

    return packmap({
      outdir: "dist",
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {
          react: "/dist/react@16.9.0/umd/react.production.min.js"
        }
      });
      expect(fsMock.getOutputModuleDir("react")).toBe("/dist/react@16.9.0/umd");
    });
  });
});
