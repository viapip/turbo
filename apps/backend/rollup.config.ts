import build from '@sozdev/rollup-build'

export default build({
  src: './src/server/',

  pkg: 'package.json',
  tsconfig: 'tsconfig.build.json',
  input: 'index.ts',
  dts: {
    respectExternal: true,
  },
  // dts: {
  //   respectExternal: false,
  //   compilerOptions: {
  //     declarationDir: './src/types/',
  //     declaration: true,
  //   },
  // },
})
