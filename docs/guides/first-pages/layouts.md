# First Pages >> Layouts ||60

The following templates are always available:

- `layout-raw` No html or any wrapping (use it for xml, json, ... outputs)
- `layout-default` For content
- `layout-index` Extends content and adds an "Open Navigation" button for mobile

Layout Default has the following Joining Blocks:

- `head` For the html `<head>`
- `header` Within the top `<header>`
- `content` Html within the main content section
- `footer` Within to bottom `<footer>`
- `bottom` Add the end of the body

## Launch Preset

On top of the above it adds the following templates

- `layout-404` A space not found page
- `layout-home` Frontpage with center logo below text
- `layout-home-background` Frontpage with left text and background image on the right
- `layout-sidebar` Left sidebar, right content
- `layout-index` Extends layout-sidebar

And the following changes

- Sets `layout-sidebar` as the default layout
