---
'@rocket/cli': patch
---

Introducing `rocket lint` to verify if all your links are correct.

There are two modes:

```bash
# check existing production build in _site (need to execute "rocket build" before)
rocket lint

# run a fast html only build and then check it
rocket lint --build-html
```
