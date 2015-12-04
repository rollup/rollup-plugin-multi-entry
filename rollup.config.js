import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.js',
  plugins: [babel()],
  format: 'cjs',
  dest: 'dist/rollup-plugin-multi-entry.cjs.js'
};
