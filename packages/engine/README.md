# Rocket Engine

## Data cascade

docs/recursive.data.js => docs/**/\*
docs/foo/recursive.data.js => docs/foo/**/\*

docs/local.data.js => docs/_
docs/foo/local.data.js => docs/foo/_

1. file
2. thisDir & thisAndSubDirs (current dir)
3. thisAndSubDir parents
4. presets in order

TODO:

- cleanup `*.md.js` files after finish
