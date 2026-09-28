const path = require('node:path');

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
    // Every stylesheet can use the breakpoints' @custom-media without
    // importing them; the definitions themselves are not emitted.
    ['@csstools/postcss-global-data', {
      files: [path.join(__dirname, 'src/Styles/Variables/breakpoints.css')]
    }],
    'postcss-custom-media',
    'postcss-color-function',
    'postcss-nested'
  ]
};
