## Features

- Rename "options.docsDir" to "options.inputDir"
- recursive rendering of lit / html / and markdown
- convert `<meta name="menu:link.text" content="Docs" />` to `export const menuLinkText = 'Docs';`
- "import" markdown with frontmatter
- export const mdCleanup = false; => to not clean up auto generated md files for this page
- add helper for layouts
- Add "menuExclude" => to actually exclude the menu item

## Bugs

- write to `_site-dev` instead of `_site` while using `rocket start`
- nested `recursive.data.js` do not overwrite the parent data
- rocketGeneratedMdInJs => converted-md-source
- rocketGeneratedFromMd => converted-md
- support <!-- asdf --> in markdown
- ssr render can just be a string concat

## Error Handling

- make error nice for "needs function export default () => html` instead of just export default html`"
- make error nice for parent page not found in index => auto generate page? 🤔

## Examples

- docs site, blog (simple), blog (complex), minimal
- add stackblitz/codesandbox examples

- Example: export variable and use it in rendering
- Example: fetch data from an api and display it
- Example: usage of image

## later

- support `@change` in markdown
- support "hey ${foo.map(f => `${f} + 1`)}"

## consider

- Replace magic "resolve:pkg/foo.css" with a directive `${resolve()}`?
