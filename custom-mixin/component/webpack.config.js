const PACKAGE = require('mathjax-full/components/webpack.common.js');

module.exports = PACKAGE(
  'custom-mixin',                        // the package to build
  '../js',  // location of the MathJax js library
  [                                      // component libraries to link to
    'components/src/core/lib'
  ],
  __dirname,                             // our directory
  '.'                                    // dist directory
);
