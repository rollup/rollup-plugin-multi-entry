/* @flow */

type Config =
  | string
  | Array<string>
  | { include?: Array<string>, exclude?: Array<string>, exports?: boolean };

import { promise as matched } from 'matched';

const entry = '\0rollup-plugin-multi-entry:entry-point';

export default function multiEntry(config: ?Config = null) {
  let include = [];
  let exclude = [];
  let exporter = buildNamedExports;

  function configure(config: Config) {
    if (typeof config === 'string') {
      include = [config];
    } else if (Array.isArray(config)) {
      include = config;
    } else {
      include = config.include || [];
      exclude = config.exclude || [];
      if (config.exports === false) {
        exporter = buildEmptyExports;
      } else if (config.exports === 'array') {
        exporter = buildArrayExports;
      }
    }
  }

  if (config) {
    configure(config);
  }

  return {
    options(options: { input: ?string }) {
      if (options.input && options.input !== entry) {
        configure(options.input);
      }
      options.input = entry;
    },

    resolveId(id: string): ?string {
      if (id === entry) {
        return entry;
      }
    },

    load(id: string): ?Promise<string> {
      if (id === entry) {
        if (!include.length) {
          return Promise.resolve('');
        }
        const patterns = include.concat(exclude.map(pattern => '!' + pattern));
        return matched(patterns, { realpath: true }).then(paths =>
          exporter(paths)
        );
      }
    }
  };
}

function buildNamedExports(paths) {
  return paths.map(path => `export * from ${JSON.stringify(path)};`).join('\n');
}

function buildEmptyExports(paths) {
  return paths.map(path => `import ${JSON.stringify(path)};`).join('\n');
}

function buildArrayExports(paths) {
  return (
    paths
      .map((path, index) => `import _m${index} from ${JSON.stringify(path)}`)
      .join(';\n') +
    ';\n' +
    'export default [\n' +
    paths.map((path, index) => `_m${index}`).join(', ') +
    '\n];\n'
  );
}
