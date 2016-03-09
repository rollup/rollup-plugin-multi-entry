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

This plugin requires at least v0.25.4 of rollup. In `rollup.config.js`:

```js
import multiEntry from 'rollup-plugin-multi-entry';

export default {
  entry: 'test/**/*.js',
  plugins: [multiEntry()]
};
```

The `entry` above is the simplest form which simply takes a glob string. If you
wish, you may pass an array of glob strings or, for finer control, an object
with `include` and `exclude` properties each taking an array of glob strings,
e.g.

```js
// The usual rollup entry configuration works.
export default {
  entry: 'just/one/file.js',
  plugins: [multiEntry()]
  // ...
};

// As does a glob of files.
export default {
  entry: 'a/glob/of/files/**/*.js',
  plugins: [multiEntry()]
  // ...
};

// Or an array of files and globs.
export default {
  entry: ['an/array.js', 'of/files.js', 'or/globs/**/*.js'],
  plugins: [multiEntry()]
  // ...
};

// For maximum control, arrays of globs to include and exclude.
export default {
  entry: {
    include: ['files.js', 'and/globs/**/*.js', 'to/include.js'],
    exclude: ['those/files.js', 'and/globs/*.to.be.excluded.js']
  },
  plugins: [multiEntry()]
  // ...
};
```

## License

MIT
