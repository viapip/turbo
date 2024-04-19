import * as fs from 'node:fs'
import * as path from 'node:path'
import * as process from 'node:process'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { wasm } from '@rollup/plugin-wasm'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const cwdDir = path.resolve(process.cwd(), '.')

const pkgFile = path.join(cwdDir, 'package.json')

const pkg = JSON.parse(
  fs.readFileSync(
    pkgFile,
    { encoding: 'utf-8' },
  ),
)

const tsconfigFile = path.join(cwdDir, 'tsconfig.build.json')

export default defineConfig([
  {
    input: './src/server/index.ts',
    output: [
      {
        inlineDynamicImports: true,
        file: pkg.main,
        format: 'esm',
      },
    ],
    plugins: [
      json(),
      resolve({
        preferBuiltins: true,
      }),
      wasm(),
      commonjs(),
      esbuild({
        minify: true,
        tsconfig: tsconfigFile,
        target: 'esnext',

      }),
    ],
  },

  {
    input: 'src/types/index.ts',
    output: [
      {
        file: pkg.types,
      },
    ],
    plugins: [
      dts({
        respectExternal: false,
        tsconfig: tsconfigFile,
      }),
    ],
  },
])
