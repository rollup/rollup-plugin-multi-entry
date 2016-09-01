/* @flow */

type Config = string | Array<string> | { include?: Array<string>, exclude?: Array<string>, exports?: boolean };

import { resolve } from 'path';
import { promise as matched } from 'matched';

const entry = '\0rollup-plugin-multi-entry:entry-point';

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
    options(options: { entry: ?string }) {
      if (options.entry && options.entry !== entry) {
        configure(options.entry);
      }
      options.entry = entry;
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
        return matched(patterns, { realpath: true }).then(paths => paths.map(exporter).join('\n'));
      }
    }
  }
}
