const reload = require('require-nocache')(module);

// TypeScript sources, loaded through Node's built-in type stripping.
const cssVarsFiles = [
  './src/Styles/Variables/dimensions.ts',
  './src/Styles/Variables/fonts.ts',
  './src/Styles/Variables/animations.ts',
  './src/Styles/Variables/zIndexes.ts'
].map((f) => require.resolve(f));

const mixinsFiles = [
  'frontend/src/Styles/Mixins/cover.css',
  'frontend/src/Styles/Mixins/linkOverlay.css',
  'frontend/src/Styles/Mixins/scroller.css',
  'frontend/src/Styles/Mixins/truncate.css'
];

module.exports = {
  plugins: [
    'autoprefixer',
    ['postcss-mixins', {
      mixinsFiles
    }],
    ['postcss-simple-vars', {
      variables: () =>
        cssVarsFiles.reduce((acc, vars) => {
          return Object.assign(acc, reload(vars).default);
        }, {})
    }],
    'postcss-color-function',
    'postcss-nested'
  ]
};
