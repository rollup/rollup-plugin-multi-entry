import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

var pkg = require('./package.json');

export default {
  entry: 'index.js',
  plugins: [babel(babelrc())],
  external: Object.keys(pkg['dependencies']).concat('path'),
  targets: [
    {
      format: 'cjs',
      dest: pkg['main']
    },
    {
      format: 'es',
      dest: pkg['jsnext:main']
    }
  ]
};
