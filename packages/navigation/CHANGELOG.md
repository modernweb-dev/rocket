# @rocket/navigation

## 0.2.1

### Patch Changes

- 728a205: feat(navigation): add no-redirects attribute

  By default, the sidebar nav redirects clicks on category headings to
  their first child.

  To disable those redirects, override
  \_includes/\_joiningBlocks/\_layoutSidebar/sidebar/20-navigation.njk
  and add the no-redirects attribute to the <rocket-navigation>
  element.

## 0.2.0

### Minor Changes

- 8bdc326: Make sure anchor scrolling works also with a closing drawer animation

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release
