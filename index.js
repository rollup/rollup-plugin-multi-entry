type Config = string | Array<string> | { include: Array<string>, exclude: Array<string> };

import glob from 'glob';

export const entry = '\0rollup-plugin-multi-entry:entry-point';

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
      ({ include = [], exclude = [] } = config);
      if (config.exports === false) {
        exporter = path => `import ${JSON.stringify(path)};`;
      }
    }
  }

  if (config) {
    configure(config);
  }

  return {
    options(options: {entry: string}) {
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

    load(id: string): ?Promise {
      if (id === entry) {
        return Promise.all(
          [matchPaths(include), matchPaths(exclude)]
        ).then(([includePaths, excludePaths]) => {
          return includePaths.filter(path => excludePaths.indexOf(path) < 0);
        }).then(paths => {
          return paths.map(exporter).join('\n');
        });
      }
    }
  }
}

function matchPaths(patterns: Array<string>): Promise<Array<string>> {
  return Promise.all(
    patterns.map(pattern => new Promise(
      (resolve, reject) => glob(pattern, { realpath: true }, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      })
    ))
  ).then(
    lists => lists.reduce((result, list) => result.concat(list), [])
  );
}
