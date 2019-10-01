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
Packmap will create a browser-ready directory and import map from a package.json file. To use it, your packages must meet the following standards:

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
packmap -p ../my-package
```

## Javascript usage
Packmap is a node package that is used as follows:

```js
const packmap = require('packmap');

const options = {
  outdir: 'dist', // defaults to dist
  package: 'path/to/package.json', // defaults to package.json
}

packmap(options)
.then(() => {
  console.log('done!')
})
.catch(err => {
  console.error(err)
})
```