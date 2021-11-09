---
'@rocket/cli': patch
'@mdjs/mdjs-preview': patch
---

Allow only a limited set of characters for simulator includes `[a-zA-Z0-9\/\-_]`.
Notably, there is no:

- `:` to prevent `http://...` includes
- `.` so filenames as `this.is.my.js` are not supported. Also includes will be without file endings which will be added automatically
