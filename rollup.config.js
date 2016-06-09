import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.js',
  plugins: [babel()],
  targets: [
    {
      format: 'cjs',
      exports: 'named',
      dest: 'dist/rollup-plugin-multi-entry.cjs.js'
    },
    {
      format: 'es6',
      exports: 'named',
      dest: 'dist/rollup-plugin-multi-entry.es6.js'
    }
  ]
};
