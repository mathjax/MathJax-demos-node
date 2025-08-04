/*************************************************************************
 *
 *  cjs/util/Mixed.js
 *
 *  Utilities for MathJax v4 command-line tools using direct access to
 *  the MathJax modules, coupled with the ability to load components.
 *
 * ----------------------------------------------------------------------
 *
 *  Copyright (c) 2025 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

//
// Load and configure Util.js
//
const {Util} = require('./Util.js');
const {Direct} = require('./Direct.js');
Util.mixed = true;

//
// Load the component definitions
//
const {mathjax} = require('@mathjax/src/js/mathjax.js');
const {Loader} = require('@mathjax/src/js/components/loader.js');
const {Package} = require('@mathjax/src/js/components/package.js');
require('@mathjax/src/components/js/startup/init.js');
require('@mathjax/src/components/js/core/lib/core.js');
require('@mathjax/src/components/js/adaptors/liteDOM/liteDOM.js');
require('@mathjax/src/components/js/a11y/semantic-enrich/semantic-enrich.js');
require('@mathjax/src/components/js/a11y/speech/speech.js');

//
// Record the pre-loaded component files
//
Loader.preLoaded(
  'loader', 'startup',
  'core',
  'adaprots/liteDOM',
  'a11y/semantic-enrich',
  'a11y/speech',
);

//
// Set up file loaders
//
MathJax.config.loader.require = (file) => Util.import(file);
mathjax.asyncLoad = (file) => {
  return file.substring(0, 5) === 'node:' ? require(file) : Util.import(Package.resolvePath(file));
};

//
// The Mixed object definition
//
const Mixed = exports.Mixed = {
  /**
   * Create the MathDocument from the given data.
   *
   * @param {InputJax} input    The input jax instance to use
   * @param {OutputJax} output  The output jax instance to use
   * @param {OptionList} args   The command-line arguments
   * @returns {MathDocument}    The MathDocument using the jax and data
   */
  document(input, output, args) {
    //
    // Just use the Direct version
    //
    return Direct.document(input, output, args);
  },

  /**
   * The hooks needed for this utility.
   */
  hooks: {
    //
    // Just use the Direct version
    //
    args: Direct.hooks.args,
  }
};
