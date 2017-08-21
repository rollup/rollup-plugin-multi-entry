/* @flow */

type Config = string | Array<string> | { include?: Array<string>, exclude?: Array<string>, exports?: boolean };

import { promise as matched } from 'matched';

const input = '\0rollup-plugin-multi-entry:entry-point';

export default function multiEntry(config: ?Config=null) {
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
    options(options: { input: ?string }) {
      if (options.input && options.input !== input) {
        configure(options.input);
      }
      options.input = input;
    },

    resolveId(id: string): ?string {
      if (id === input) {
        return input;
      }
    },

    load(id: string): ?Promise<string> {
      if (id === input) {
        if (!include.length) {
          return Promise.resolve('');
        }
        const patterns = include.concat(exclude.map(pattern => '!' + pattern));
        return matched(patterns, { realpath: true }).then(paths => paths.map(exporter).join('\n'));
      }
    }
  }
}
