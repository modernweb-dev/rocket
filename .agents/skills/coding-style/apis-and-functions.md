# APIs and Functions

Keep function signatures easy to read at the call site. Prefer positional parameters only when their meaning is obvious and the argument list stays short.

When a function would take more than two parameters, prefer a single object parameter with named properties:

```js
foo({ some: 'stuff', safe: true, retries: 2 });
```

Avoid signatures that require readers to remember positional meaning:

```js
foo('stuff', true, 2);
```

Also prefer an object parameter for fewer arguments when a primitive or boolean flag would be ambiguous at the call site:

```js
foo({ some: 'stuff', safe: true });
```

Keep existing public APIs stable unless the task explicitly includes changing callers. For private helpers, update the call sites when the object form makes the code clearer.
