/* @flow */

type Config =
  | string
  | Array<string>
  | { include?: Array<string>, exclude?: Array<string>, exports?: boolean };

import { promise as matched } from 'matched';
import fs from 'fs';

const entry = '\0rollup-plugin-multi-entry:entry-point';

export default function multiEntry(config: ?Config = null) {
  let include = [];
  let exclude = [];
  let exporter = path => `export * from ${JSON.stringify(path)};`;
  let defaultExporter = path =>
    `export {default} from ${JSON.stringify(path)};`;

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
        return matched(patterns, { realpath: true }).then(paths => {
          // real hacky way to check if there's a default export
          let stmts: string[] = [];
          for (const path of paths) {
            const f = fs.readFileSync(path);
            if (/^export default /m.test(f.toString())) {
              stmts.push(defaultExporter(path));
            }
            stmts.push(exporter(path));
          }
          return stmts.join('\n');
        });
      }
    }
  };
}
