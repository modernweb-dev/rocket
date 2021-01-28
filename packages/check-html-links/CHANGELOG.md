# check-html-links

## 0.1.2

### Patch Changes

- f343c50: When reading bigger files, especially bigger files with all content on one line it could mean a read chunk is in the middle of a character. This can lead to strange symbols in the resulting string. The `hightWaterMark` is now increased from the node default of 16KB to 256KB. Additionally, the `hightWaterMark` is now synced for reading and parsing.

## 0.1.1

### Patch Changes

- eb74110: Add info about how many files and links will be checked

## 0.1.0

### Minor Changes

- cd22231: Initial release
