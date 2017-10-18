import multiEntry from '../';
import { ok } from 'assert';
import { rollup } from 'rollup';

function includes(string, substring) {
  if (string.indexOf(substring) === -1) {
    ok(false, `expected ${JSON.stringify(string)} to include ${JSON.stringify(substring)}`);
  }
}

function doesNotInclude(string, substring) {
  if (string.indexOf(substring) !== -1) {
    ok(false, `expected ${JSON.stringify(string)} not to include ${JSON.stringify(substring)}`);
  }
}

function makeBundle(entries, options) {
  let config = { input: entries, plugins: [multiEntry()] };
  Object.assign(config, options);
  return rollup(config);
}

describe('rollup-plugin-multi-entry', () => {
  it('takes a single file as input', () => {
    return makeBundle('test/fixtures/0.js').then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({code}) => {
        includes(code, 'exports.zero = zero;');
      });
    })
  });

  it('takes an array of files as input', () => {
    return makeBundle(['test/fixtures/0.js', 'test/fixtures/1.js']).then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({code}) => {
        includes(code, 'exports.zero = zero;');
        includes(code, 'exports.one = one;');
      });
    })
  });

  it('allows an empty array as input', () => {
    return makeBundle([]).then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({code}) => {
        doesNotInclude(code, 'exports');
      });
    })
  });

  it('takes a glob as input', () => {
    return makeBundle('test/fixtures/{0,1}.js').then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({code}) => {
        includes(code, 'exports.zero = zero;');
        includes(code, 'exports.one = one;');
      });
    })
  });

  it('takes an array of globs as input', () => {
    return makeBundle(['test/fixtures/{0,}.js', 'test/fixtures/{1,}.js']).then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({code}) => {
        includes(code, 'exports.zero = zero;');
        includes(code, 'exports.one = one;');
      });
    })
  });

  it('takes an {include,exclude} object as input', () => {
    return makeBundle(
      { include: ['test/fixtures/*.js'], exclude: ['test/fixtures/1.js'] }
    ).then(bundle => {
      return bundle.generate({ format: 'cjs' }).then(({code}) => {
        includes(code, 'exports.zero = zero;');
        doesNotInclude(code, 'exports.one = one;');
      });
    })
  });

  it('allows to prevent exporting', () => {
    return makeBundle(
      { include: ['test/fixtures/*.js'], exports: false }
    ).then(bundle => {
			return bundle.generate({ format: 'cjs' }).then(({code}) => {
        includes(code, `console.log('Hello, 2');`)
        doesNotInclude(code, 'zero');
        doesNotInclude(code, 'one');
      });
    })
  );

  it('overrides external option as function (fix issue #20)', () =>
	  return makeBundle(['test/externalTest/0.js', 'test/externalTest/1.js'], {
		  external: id => !(/externalTest/.test(id)),
		  onwarn: (warning) => {
				throw new Error('This test must not throw warning : ' + warning.message);
      }
	  }).then(bundle => {
			return bundle.generate({ format: 'cjs' }).then(({ code }) => {
			  includes(code, 'require(\'external\')');
				includes(code, 'const one = external;');
			});
	  })
	);
	
	it('overrides external option as array (fix issue #20)', () =>
		return makeBundle(['test/externalTest/0.js', 'test/externalTest/1.js'], {
			external: ['external'],
			onwarn: (warning) => {
				throw new Error('This test must not throw warning : ' + warning.message);
			}
		}).then(bundle => {
			return bundle.generate({ format: 'cjs' }).then(({ code }) => {
			  includes(code, 'require(\'external\')');
				includes(code, 'const one = external;');
			});
		})
	);
});
