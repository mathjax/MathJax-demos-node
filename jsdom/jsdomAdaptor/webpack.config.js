const PACKAGE = require('mathjax-full/components/webpack.common.js');

module.exports = PACKAGE(
  'adaptor',                            // the package to build
  '../node_modules/mathjax-full/js',    // location of the MathJax js library
  ['components/src/core/lib'],          // packages to link to
  __dirname,                            // our directory
  '.'                                   // dist directory
);
