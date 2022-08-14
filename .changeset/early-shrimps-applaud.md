---
'@rocket/engine': patch
---

Prevent fatal error because of simultaneous write to file.

When the browser requested a file to be rendered and that file also needed an update in the "rocket header" (the top of the file) then it could be that the watcher trigger a simultaneous render of the file while the first render was still in progress.

The solution is that the watcher ignores changes to a file until a full render is finished.
