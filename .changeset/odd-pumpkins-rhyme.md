---
'plugins-manager': patch
---

Add a "hidden" feature in addPlugin that if you attach a `wrapPlugin` property to the returning function it will call `wrapPlugin` on the plugin before adding it.
