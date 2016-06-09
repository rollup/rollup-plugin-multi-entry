import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

export default {
  entry: 'index.js',
  plugins: [babel(babelrc())],
  targets: [
    {
      format: 'cjs',
      exports: 'named',
      dest: 'dist/rollup-plugin-multi-entry.js'
    },
    {
      format: 'es6',
      exports: 'named',
      dest: 'dist/rollup-plugin-multi-entry.mjs'
    }
  ]
};
