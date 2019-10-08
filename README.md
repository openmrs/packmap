# packmap

Turn a package.json into a browser-ready import map

## Quickstart

Install the library:

```sh
npm install --save-dev packmap
```

Now add the following to your package.json:

```json
{
  "scripts": {
    "build": "packmap"
  }
}
```

And run the following:

```sh
npm run build
```

## Explanation of packmap

Packmap will create a browser-ready directory and import map from a package.json file and node_modules. To use it, your packages must meet the following standards:

1. All package.json `dependencies` must be in-browser dependencies instead of build-time dependencies.
2. There must be only one version of every package. Semantic versioning rules apply.
3. Packages may have `directories.lib` in their package.json to specify which directory should be made available to the browser.

## CLI usage

`packmap` may be run as a CLI. To see the available options, run the following:

```sh
npx packmap --help
```

### CLI Examples

```sh
# output to build directory
packmap -o build

# specify path to package.json
packmap -p ../my-package/package.json

# specify path to import-map which overrides generated import-map
packmap --override-map ./override-import-map.json

# specify current working directory to base relative urls on.
# In this example, the main package.json will be loaded from subdir, and the
# outputted dist director will also be created inside of subdir.
packmap --cwd ./subdir
```

## Javascript usage

Packmap is a node package that is used as follows:

```js
const packmap = require("packmap");

const options = {
  // required
  outdir: "dist",

  // required
  package: "path/to/package.json",

  // optional
  overrideMap: "path/to/override-map.json",

  // optional - defaults to process.cwd()
  cwd: "./subdir",

  // optional - defaults to not logging any packmap info messages.
  // The log function can be used to pipe the logged output of packmap to
  // whatever you'd like it to (stdout, other file, something else).
  log(message) {
    console.log(message);
  }
};

packmap(options)
  .then(() => {
    console.log("done!");
  })
  .catch(err => {
    console.error(err);
  });
```
