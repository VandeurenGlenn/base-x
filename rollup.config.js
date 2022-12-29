import typescript from '@rollup/plugin-typescript';

export default [{
  input: ['./src/base-x.ts'],
  output: [{
    dir: './',
    format: 'es'
  }],
  plugins: [
    typescript()
  ]
}]
