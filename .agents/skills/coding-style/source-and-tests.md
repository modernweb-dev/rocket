# Source and Test Files

Prefer colocated tests. For `src/foo.js`, put the test in `src/foo.test.js`. For nested modules, keep the test next to the source file it covers.

Name source files after their primary export. Use `camelCase` for functions and plain modules, and `UpperCamelCase` for classes and custom elements:

- `src/mySuperFunction.js`
- `src/mySuperFunction.test.js`
- `src/MyElement.js`
- `src/MyElement.test.js`

For new Node tests, prefer `describe` and `it` from `node:test`:

```js
import { describe, it } from 'node:test';

describe('Test addressList', () => {
  it('01: finds default address', async () => {
    // ...
  });
});
```

Use numbered `it` cases (`01:`, `02:`, etc.) when a module has multiple behavior examples. Keep test names behavior-focused.
