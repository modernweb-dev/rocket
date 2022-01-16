- support `@change` in markdown
- support "hey ${foo.map(f => `${f} + 1`)}"

- add helper for layouts
- recursive rendering of lit / html / and markdown

- convert meta menu.link.text to `export const menuLinkText = 'Guides'

- "import" markdown with frontmatter

- make error nice for "needs function export default () => html` instead of just export default html`"
- make error nice for parent page not found in index

- export const mdCleanup = false; => to not clean up auto generated md files for this page
-

- Example: export variable and use it in rendering
- Example: fetch data from an api and display it
- Example: usage of image

- Replace magic "resolve:pkg/foo.css" with a directive `${resolve()}`?
