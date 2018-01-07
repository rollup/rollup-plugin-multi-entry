import babel from 'rollup-plugin-babel';

var pkg = require('./package.json');

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      presets: [['env', { targets: { node: '4' }, modules: false }]],
      plugins: ['transform-flow-strip-types'],
      babelrc: false
    })
  ],
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
