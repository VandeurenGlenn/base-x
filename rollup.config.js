import typescript from '@rollup/plugin-typescript';

export default [{
  input: ['./src/index.ts'],
  output: [{
    dir: './',
    format: 'es'
  }],
  plugins: [
    typescript({
      "outDir": "./",
      "allowJs": true,
      "target": "es2022",
      "declaration": true
    })
  ]
}]
