# x-exec

Simple convenience wrapper for doing shell stuff in node. Provides a few helpful functions
wrapping `child_process.exec/execSync`:

## Synchronous API

```ts
import exec from 'x-exec';

// `err` is null | ErrData, `output` is whatever went to stdout
const [err, output] = exec(`which cowsay`);

// returns whatever would have gone to stdout
// but if there was an error, logs it and exits "1"
const output = exec.exit(`which cowsay`);

// swallows stdout, and just returns a boolean for exit code
const success = exec.success(`which cowsay`);

// passes stdout/err thru to parent process stdout/err
// returning boolean for exit code
const success = exec.out(`which cowsay`);
```

## Async (Promise) API

```ts
import exec from 'x-exec';

// `err` is null | ErrData, `output` is whatever went to stdout
const [err, output] = await exec.async(`which cowsay`);

// returns whatever would have gone to stdout
// but if there was an error, logs it and exits "1"
const output = await exec.async.exit(`which cowsay`);

// swallows stdout, and just returns a boolean for exit code
const success = await exec.async.success(`which cowsay`);

// there is no async version of `exec.out`
```
