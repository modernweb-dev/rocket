## Features

- ssr render can just be a string concat
- enable web dev server middleware (to add an api proxy)
- Rename "options.docsDir" to "options.inputDir"
- recursive rendering of lit / html / and markdown
  - "import" markdown with frontmatter
- mdjs update to unified v10 AND go esm only (only cjs pkg we have now)

## Nice to have

- Add "menuExclude" => to actually exclude the menu item

## Bugs

- Failed to resolve dependency "plugins-manager" in "/web/rocket/packages/launch/src/rocketLaunch.js"
  Error: Cannot find module '/web/rocket/node_modules/plugins-manager/dist/index.cjs'
  => mdjs is still requirejs 😭

- write to `_site-dev` instead of `_site` while using `rocket start`
- nested `recursive.data.js` do not overwrite the parent data
- support <!-- asdf --> in markdown

## Error Handling

- make error nice for parent page not found in index => auto generate page? 🤔

## Examples

- docs site, blog (simple), blog (complex), minimal
- add stackblitz/codesandbox examples => does not work because of `@parcel/watcher` https://github.com/parcel-bundler/watcher/issues/99

- Example: export variable and use it in rendering
- Example: fetch data from an api and display it
- Example: usage of image

## later

- support `@change` in markdown
- support "hey ${foo.map(f => `${f} + 1`)}"

## consider

- Replace magic "resolve:pkg/foo.css" with a directive `${resolve()}`?
