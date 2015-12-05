import config from './rollup.config';

config.format = 'cjs';
config.dest = 'dist/rollup-plugin-multi-entry.cjs.js';

export default config;
