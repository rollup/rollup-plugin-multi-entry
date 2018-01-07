import multiEntry from '../';
import { ok } from 'assert';
import { rollup } from 'rollup';

function includes(string, substring) {
  if (string.indexOf(substring) === -1) {
    ok(
      false,
      `expected ${JSON.stringify(string)} to include ${JSON.stringify(
        substring
      )}`
    );
  }
}

function doesNotInclude(string, substring) {
  if (string.indexOf(substring) !== -1) {
    ok(
      false,
      `expected ${JSON.stringify(string)} not to include ${JSON.stringify(
        substring
      )}`
    );
  }
}

function makeBundle(entries) {
  return rollup({ input: entries, plugins: [multiEntry()] });
}

describe('rollup-plugin-multi-entry', () => {
  it('takes a single file as input', () => {
    return makeBundle('test/fixtures/0.js').then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({ code }) => {
        includes(code, 'exports.zero = zero;');
      });
    });
  });

  it('takes an array of files as input', () => {
    return makeBundle(['test/fixtures/0.js', 'test/fixtures/1.js']).then(
      bundle => {
        return bundle.generate({ format: 'cjs' }).then(({ code }) => {
          includes(code, 'exports.zero = zero;');
          includes(code, 'exports.one = one;');
        });
      }
    );
  });

  it('allows an empty array as input', () => {
    return makeBundle([]).then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({ code }) => {
        doesNotInclude(code, 'exports');
      });
    });
  });

  it('takes a glob as input', () => {
    return makeBundle('test/fixtures/{0,1}.js').then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({ code }) => {
        includes(code, 'exports.zero = zero;');
        includes(code, 'exports.one = one;');
      });
    });
  });

  it('takes an array of globs as input', () => {
    return makeBundle(['test/fixtures/{0,}.js', 'test/fixtures/{1,}.js']).then(
      bundle => {
        return bundle.generate({ format: 'cjs' }).then(({ code }) => {
          includes(code, 'exports.zero = zero;');
          includes(code, 'exports.one = one;');
        });
      }
    );
  });

  it('takes an {include,exclude} object as input', () => {
    return makeBundle({
      include: ['test/fixtures/*.js'],
      exclude: ['test/fixtures/1.js']
    }).then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({ code }) => {
        includes(code, 'exports.zero = zero;');
        doesNotInclude(code, 'exports.one = one;');
      });
    });
  });

  it('allows to prevent exporting', () => {
    return makeBundle({ include: ['test/fixtures/*.js'], exports: false }).then(
      bundle => {
        return bundle.generate({ format: 'cjs' }).then(({ code }) => {
          includes(code, `console.log('Hello, 2');`);
          doesNotInclude(code, 'zero');
          doesNotInclude(code, 'one');
        });
      }
    );
  });
});
