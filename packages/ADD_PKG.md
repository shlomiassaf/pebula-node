# Adding a package

## Adding the package code

1. `cd packages`
2. `mkdir [PACKAGE MAME]`
3. `yarn init`

- Package code should be in the `src` folder.
- `src/index.ts` should export all public members
- `index.ts` (sibling of `src`) should export all members of `src/index.ts`

Copy the scripts from an already existing package.

### Build

- Build artifacts are save in `cjs` folder (sibling of `src`)
- Files published to NPM are directories `src` and `cjs`
- Public api is exposed through `api-extractor` which exports the file `cjs/index-public.d.ts` after the build.
  - Copy a similar `api-extractor.json` file from another package.

## Docs

Add a documentation website using `docusaurus 2`:

- Get into the root of the new package (e.g. `cd packages/my-new-package`)
- Run `npx @docusaurus/init@next init website classic`
- Go into the `website` folder and edit the name in `package.json` so it reflects the path in it's name.
For example, the package `@my-org/pkg` should have the name `@my-org/pkg_website` set in it's `website/package.json` file.

You can now run the documentation site via:

```bash
yarn workspace @my-org/pkg_website start
```

Or use the dynamic runner to run any script from it:

```bash
yarn run run

# Select "@my-org/pkg_website" -> Enter
# Select "start" -> Enter
# No Arguments -> Enter
```

> Note that `lerna` and `yarn workspaces` does not support nested package names (e.g. `@my-org/pkg/website`) so use an underscore (_)

### Configuring the documentation site

Assuming our library is called `@my-org/my-lib`:

1. We need to reflect the static URL used by GitHub Pages as well as compensate for having multiple documentation sites:

    Set the `baseUrl` in **website/docusaurus.config.js** to the following expression:
  
  ```js
  process.env.GH_PAGES_BUILD ? '/pebula-node/my-lib/' : '/'

  /* Notice how we use "my-lib" without the scope, replace it with the actual library name.
  ```
  
2. We build gh-pages using a common npm script under the name **build:gh** which we
execute using `lerna run`.

    Add the documentation site to the GitHub Pages build process by adding the following script to **website/package.json** under **build:gh**:

```bash
docusaurus build --out-dir ../../../.gh-pages-build/my-lib

# Notice how we use "my-lib" without the scope, replace it with the actual library name.
```

3. Set all the settings in **website/docusaurus.config.js** according to a similar file located in an already built package.

### Internal packages

Internal packages are additional sub-packages published with the root package.

For example, if `@my-org/pkg` is the root package, `@my-org/pkg/child` will be a sub-package.

- Source code for internal packages are in a dedicated folder next to the `src` folder (e.g. `child`).
- Structure should be similar to root package with `package.json` containing only the `name`, nothing else.
- Add the additional packages to the `files` list in root `package.json` so they are published.
