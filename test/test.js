import { ok } from 'assert';
import { rollup } from 'rollup';
import multiEntry from '../';

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

function getCodeFromBundle(entries) {
  return rollup({ input: entries, plugins: [multiEntry()] })
    .then(bundle => bundle.generate({ format: 'cjs' }))
    .then(generated =>
      generated.output ? generated.output[0].code : generated.code
    );
}

describe('rollup-plugin-multi-entry', () => {
  it('takes a single file as input', () =>
    getCodeFromBundle('test/fixtures/0.js').then(code =>
      includes(code, 'exports.zero = zero;')
    ));

  it('takes an array of files as input', () =>
    getCodeFromBundle(['test/fixtures/0.js', 'test/fixtures/1.js']).then(
      code => {
        includes(code, 'exports.zero = zero;');
        includes(code, 'exports.one = one;');
      }
    ));

  it('allows an empty array as input', () =>
    getCodeFromBundle([]).then(code => doesNotInclude(code, 'exports')));

  it('takes a glob as input', () =>
    getCodeFromBundle('test/fixtures/{0,1}.js').then(code => {
      includes(code, 'exports.zero = zero;');
      includes(code, 'exports.one = one;');
    }));

  it('takes an array of globs as input', () =>
    getCodeFromBundle(['test/fixtures/{0,}.js', 'test/fixtures/{1,}.js']).then(
      code => {
        includes(code, 'exports.zero = zero;');
        includes(code, 'exports.one = one;');
      }
    ));

  it('takes an {include,exclude} object as input', () =>
    getCodeFromBundle({
      include: ['test/fixtures/*.js'],
      exclude: ['test/fixtures/1.js']
    }).then(code => {
      includes(code, 'exports.zero = zero;');
      doesNotInclude(code, 'exports.one = one;');
    }));

  it('allows to prevent exporting', () =>
    getCodeFromBundle({
      include: ['test/fixtures/*.js'],
      exports: false
    }).then(code => {
      includes(code, `console.log('Hello, 2');`);
      doesNotInclude(code, 'zero');
      doesNotInclude(code, 'one');
    }));
});
