---
'@rocket/engine': patch
---

Remove the lit workaround to globally load the `global-dom-shim` in the "main thread".
Which means only the worker that does the actual SSR rendering will load it.
