type Config = string | Array<string> | { include: Array<string>, exclude: Array<string> };

import glob from 'glob';

export const entry = 'rollup-plugin-multi-entry:entry-point';

export default function multiEntry(config: Config) {
  let include = [];
  let exclude = [];

  if (typeof config === 'string') {
    include = [config];
  } else if (Array.isArray(config)) {
    include = config;
  } else {
    ({ include, exclude } = config);
  }

  return {
    resolveId(id) {
      if (id === entry) {
        return entry;
      }
    },

    load(id) {
      if (id === entry) {
        return Promise.all(
          [matchPaths(include), matchPaths(exclude)]
        ).then(([includePaths, excludePaths]) => {
          return includePaths.filter(path => excludePaths.indexOf(path) < 0);
        }).then(paths => {
          return paths.map(path => `export * from ${JSON.stringify(path)};`).join('\n');
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
