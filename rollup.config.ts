import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from '@wessberg/rollup-plugin-ts'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

const pkg = require('./package.json')

const libraryName = 'index'

export default {
  // 表示打包入口文件
  input: `src/${libraryName}.ts`,

  // 表示输出的目标文件，是一个对象数组。可以指定输出的格式，比如umd， es模式等
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],

  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  // 声明其外部依赖，可以不打包进bundle中
  external: [],

  // 监听文件是否发生变化，只有在编译的时候开启 --watch 才生效【就是开启一个终端一直监听文件是否发生变化】，
  watch: {
    include: 'src/**'
  },

  // 编译过程中使用的插件，其中 rollup-plugin-typescript2 就是用来编译 TypeScript 文件，
  // useTsconfigDeclarationDir 表示使用 tsconfig.json 文件中定义的 declarationDir。
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ tsconfig: 'tsconfig.json' }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),

    // 针对构建的代码进行压缩
    terser()
  ]
}
