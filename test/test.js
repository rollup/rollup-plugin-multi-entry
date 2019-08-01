import { join as joinPaths } from 'path';
import { ok, deepStrictEqual } from 'assert';
import { rollup } from 'rollup';
import multiEntry from '../';

const TMP_DIR = joinPaths(__dirname, '../tmp');
let tmpModuleGuid = 0;

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

function getModuleFromBundle(entries) {
  let outputPath = joinPaths(TMP_DIR, 'module' + tmpModuleGuid++ + '.js');

  return rollup({ input: entries, plugins: [multiEntry()] })
    .then(bundle => bundle.write({ format: 'cjs', file: outputPath }))
    .then(() => require(outputPath));
}

describe('rollup-plugin-multi-entry', () => {
  it('takes a single file as input', () =>
    getModuleFromBundle('test/fixtures/named-0.js').then(moduleExports => {
      deepStrictEqual(moduleExports, { zero: 0 });
    }));

  it('takes an array of files as input', () =>
    getModuleFromBundle([
      'test/fixtures/named-0.js',
      'test/fixtures/named-1.js'
    ]).then(moduleExports => {
      deepStrictEqual(moduleExports, { zero: 0, one: 1 });
    }));

  it('allows an empty array as input', () =>
    getCodeFromBundle([]).then(code => doesNotInclude(code, 'exports')));

  it('takes a glob as input', () =>
    getModuleFromBundle('test/fixtures/named-{0,1}.js').then(moduleExports => {
      deepStrictEqual(moduleExports, { zero: 0, one: 1 });
    }));

  it('takes an array of globs as input', () =>
    getModuleFromBundle([
      'test/fixtures/named-{0,}.js',
      'test/fixtures/named-{1,}.js'
    ]).then(moduleExports => {
      deepStrictEqual(moduleExports, { zero: 0, one: 1 });
    }));

  it('takes an {include,exclude} object as input', () =>
    getCodeFromBundle({
      include: ['test/fixtures/named-*.js'],
      exclude: ['test/fixtures/named-1.js']
    }).then(code => {
      includes(code, 'exports.zero = zero;');
      doesNotInclude(code, 'exports.one = one;');
    }));

  it('allows to prevent exporting', () =>
    getCodeFromBundle({
      include: ['test/fixtures/named-*.js', 'test/fixtures/sideeffect.js'],
      exports: false
    }).then(code => {
      includes(code, `console.log('Hello, 2');`);
      doesNotInclude(code, 'zero');
      doesNotInclude(code, 'one');
    }));

  it('allows exporting all default exports as an array', () =>
    getModuleFromBundle({
      include: ['test/fixtures/default-*.js'],
      exports: 'array'
    }).then(moduleExports => {
      deepStrictEqual(moduleExports, [0, 1]);
    }));

  it('exports array entries in sorted order', () =>
    getModuleFromBundle({
      include: ['test/fixtures/default-1.js', 'test/fixtures/default-0.js'],
      exports: 'array'
    }).then(moduleExports => {
      deepStrictEqual(moduleExports, [0, 1]);
    }));
});
