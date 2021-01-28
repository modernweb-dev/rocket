---
'check-html-links': patch
---

When reading bigger files, especially bigger files with all content on one line it could mean a read chunk is in the middle of a character. This can lead to strange symbols in the resulting string. The `hightWaterMark` is now increased from the node default of 16KB to 256KB. Additionally, the `hightWaterMark` is now synced for reading and parsing.
