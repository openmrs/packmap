const packmap = require("packmap");
const fsMock = require("fs-extra");

jest.mock("../lib/require-resolve.js");

describe(`skips certain dependencies that shouldn't be in the import map`, () => {
  it(`skips all typescript types`, () => {
    fsMock.mockMainPackageJson({
      version: "1.0.0",
      dependencies: {
        a: "2.0.0",
        "@types/a": "1.0.0"
      }
    });

    fsMock.mockDepPackageJson("a", {
      version: "2.0.0",
      main: "a.js"
    });

    return packmap({
      outdir: "dist",
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {
          a: "/dist/a@2.0.0/a.js"
        }
      });
      expect(fsMock.getOutputModuleDir("a")).toBe("/dist/a@2.0.0");

      expect(() => {
        fsMock.getOutputModuleDir("@types/a");
      }).toThrow();
    });
  });

  it(`doesn't put systemjs into the import map, but does put it into the output dir`, () => {
    fsMock.mockMainPackageJson({
      dependencies: {
        systemjs: "6.1.3"
      }
    });

    fsMock.mockDepPackageJson("systemjs", {
      version: "6.1.3",
      main: "dist/system.js"
    });

    return packmap({
      outdir: "dist",
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {}
      });
      expect(fsMock.getOutputModuleDir("systemjs")).toBe(
        "/dist/systemjs@6.1.3/dist"
      );
    });
  });

  it(`doesn't put import-map-overrides into the import map, but does put it into the output dir`, () => {
    fsMock.mockMainPackageJson({
      dependencies: {
        "import-map-overrides": "1.8.0"
      }
    });

    fsMock.mockDepPackageJson("import-map-overrides", {
      version: "1.8.0",
      main: "lib/import-map-overrides"
    });

    return packmap({
      outdir: "dist",
      package: "package.json",
      cwd: "/"
    }).then(() => {
      expect(fsMock.getOutputImportMap()).toEqual({
        imports: {}
      });
      expect(fsMock.getOutputModuleDir("import-map-overrides")).toBe(
        "/dist/import-map-overrides@1.8.0"
      );
    });
  });
});
