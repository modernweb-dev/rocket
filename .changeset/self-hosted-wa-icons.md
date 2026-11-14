---
'@rocket/js': patch
---

Add `pageData.setWebAwesomeIconLibrary(library)`. Layouts can point Web Awesome's `default` icon
library at a configured Icon Library, so `wa-icon` elements created by browser components, for
example in `@open-wc/components`, load SVGs from `/_rocket/wa-icons/{library}/{name}.svg` instead of
Font Awesome's CDN. The development server serves any icon of that library, and static builds
publish the whole library (about 2,000 SVG files for Bootstrap Icons). Font Awesome-only names and
variants stop resolving on Pages that opt in.
