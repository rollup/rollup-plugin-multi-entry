import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

var pkg = require('./package.json');

export default {
  input: 'index.js',
  plugins: [babel(babelrc())],
  external: Object.keys(pkg['dependencies']).concat('path'),
  output: [
    {
      format: 'cjs',
      file: pkg['main']
    },
    {
      format: 'es',
      file: pkg['jsnext:main']
    }
  ]
};
