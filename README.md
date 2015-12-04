# rollup-plugin-multi-entry

Use multiple entry points in your [rollup](https://github.com/rollup/rollup)
bundle. This is particularly useful for tests, but can also be used to package
a library. The exports from all the entry points will be combined, e.g.

```js
// a.js
export const a = 1;

// b.js
export const b = 2;

// c.js
export const c = 3;
```

Using all three files above as entry points will yield a bundle with exports for
`a`, `b`, and `c`.

## Install

```
$ npm install [--save-dev] rollup-plugin-multi-entry
```

## Usage

In `rollup.config.js`:

```js
import multiEntry, { entry } from 'rollup-plugin-multi-entry';

export default {
  entry,
  plugins: [multiEntry('test/**/*.js')]
};
```

The `multiEntry` call above is the simplest form which simply takes a glob
string. If you wish, you may pass an array of glob strings or, for finer
control, an object with `include` and `exclude` properties each taking an array
of glob strings, e.g.

```js
multiEntry('just/one/file.js');
multiEntry('a/glob/of/files/**/*.js');
multiEntry(['an/array.js', 'of/files.js', 'or/globs/**/*.js']);
multiEntry({
  include: ['files.js', 'and/globs/**/*.js', 'to/include.js'],
  exclude: ['those/files.js', 'and/globs/*.to.be.excluded.js']
});
```

## License

MIT
