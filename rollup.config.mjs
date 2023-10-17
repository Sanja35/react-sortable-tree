import fs from 'fs';
import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url))
);

export default {
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
    },
  ],
  external: [
    'react',
    'react-dom',
    'react-dnd',
    'react-dnd-html5-backend',
    'frontend-collective-react-dnd-scrollzone',
    'react-virtualized',
    'lodash.isequal',
  ],
  plugins: [
    nodeResolve(),
    postcss({
      extract: path.resolve('dist/style.css'),
      minimize: true,
    }),
    typescript({ exclude: '**/*.(test|stories).(ts|tsx)'}),
    commonjs({
      include: 'node_modules/**',
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
  ],
};
