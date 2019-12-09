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
  let exporter = path => `export * from ${JSON.stringify(path)};`;

  function configure(config: Config) {
    if (typeof config === 'string') {
      include = [config];
    } else if (Array.isArray(config)) {
      include = config;
    } else {
      include = config.include || [];
      exclude = config.exclude || [];
      if (config.exports === false) {
        exporter = path => `import ${JSON.stringify(path)};`;
      }
    }
  }

  if (config) {
    configure(config);
  }

  return {
    options(options: { input: ?string, external: any }) {
      if (options.input && options.input !== entry) {
        configure(options.input);
      }
      options.input = entry;
      if (options.external) {
        const external = options.external;
        options.external = id => {
          if (id === entry) {
            return false;
          } else if (typeof external === 'function') {
            return external(id);
          } else if (external instanceof Array) {
            return external.indexOf(id) !== -1;
          }
        };
      }
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
          paths.map(exporter).join('\n')
        );
      }
    }
  };
}
