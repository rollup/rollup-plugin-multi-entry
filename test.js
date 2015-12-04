const rollup = require('rollup').rollup;
const multiEntryPlugin = require('./dist/rollup-plugin-multi-entry.cjs');
const multiEntry = multiEntryPlugin.default;
const entry = multiEntryPlugin.entry;
const ok = require('assert').ok;

function includes(string, substring) {
  if (string.indexOf(substring) < 0) {
    ok(false, `expected ${JSON.stringify(string)} to include ${JSON.stringify(substring)}`);
  }
}

function doesNotInclude(string, substring) {
  if (string.indexOf(substring) >= 0) {
    ok(false, `expected ${JSON.stringify(string)} not to include ${JSON.stringify(substring)}`);
  }
}

describe('rollup-plugin-multi-entry', () => {
  it('takes a single file as input', () => {
    return rollup({
      entry,
      plugins: [multiEntry('test/fixtures/0.js')]
    }).then(bundle => {
      includes(bundle.generate({ format: 'cjs' }).code, 'exports.zero = zero;');
    })
  });

  it('takes an array of files as input', () => {
    return rollup({
      entry,
      plugins: [multiEntry(['test/fixtures/0.js', 'test/fixtures/1.js'])]
    }).then(bundle => {
      const code = bundle.generate({ format: 'cjs' }).code;
      includes(code, 'exports.zero = zero;');
      includes(code, 'exports.one = one;');
    })
  });

  it('allows an empty array as input', () => {
    return rollup({
      entry,
      plugins: [multiEntry([])]
    }).then(bundle => {
      const code = bundle.generate({ format: 'cjs' }).code;
      doesNotInclude(code, 'exports');
    })
  });

  it('takes a glob as input', () => {
    return rollup({
      entry,
      plugins: [multiEntry('test/fixtures/{0,1}.js')]
    }).then(bundle => {
      const code = bundle.generate({ format: 'cjs' }).code;
      includes(code, 'exports.zero = zero;');
      includes(code, 'exports.one = one;');
    })
  });

  it('takes an array of globs as input', () => {
    return rollup({
      entry,
      plugins: [multiEntry(['test/fixtures/{0,}.js', 'test/fixtures/{1,}.js'])]
    }).then(bundle => {
      const code = bundle.generate({ format: 'cjs' }).code;
      includes(code, 'exports.zero = zero;');
      includes(code, 'exports.one = one;');
    })
  });

  it('takes an {include,exclude} object as input', () => {
    return rollup({
      entry,
      plugins: [multiEntry({ include: ['test/fixtures/*.js'], exclude: ['test/fixtures/1.js'] })]
    }).then(bundle => {
      const code = bundle.generate({ format: 'cjs' }).code;
      includes(code, 'exports.zero = zero;');
      doesNotInclude(code, 'exports.one = one;');
    })
  });
});
