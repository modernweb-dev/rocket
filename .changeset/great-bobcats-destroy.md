---
'check-html-links': patch
---

Add external links validation via the flag `--validate-externals`.

You can/should provide an optional `--absolute-base-url` to handle urls starting with it as internal.

```bash
# check external urls
npx check-html-links _site --validate-externals

# check external urls but treat links like https://rocket.modern-web.dev/about/ as internal
npx check-html-links _site --validate-externals --absolute-base-url https://rocket.modern-web.dev
```
