import { defineConfig } from 'rollup';
import ts from 'rollup-plugin-ts';
import pkg from './package.json';

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      format: 'esm',
      file: './dist/index.esm.js',
    },
    {
      format: 'commonjs',
      file: './dist/index.common.js',
    },
  ],
  external: Object.keys(pkg.dependencies),
  plugins: [ts()],
});
