/*************************************************************************
 *
 *  mjs/util/Mixed.js
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
import {Util} from './Util.js';
import {Direct} from './Direct.js';
Util.mixed = true;

//
// Load the component definitions
//
import {mathjax} from '@mathjax/src/js/mathjax.js';
import {Loader} from '@mathjax/src/js/components/loader.js';
import {Package} from '@mathjax/src/js/components/package.js';
import '@mathjax/src/components/js/startup/init.js';
import '@mathjax/src/components/js/core/lib/core.js';
import '@mathjax/src/components/js/adaptors/liteDOM/liteDOM.js';
import '@mathjax/src/components/js/a11y/semantic-enrich/semantic-enrich.js';
import '@mathjax/src/components/js/a11y/speech/speech.js';

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
  return file.substring(0, 5) === 'node:' ? import(file) : Util.import(Package.resolvePath(file));
};

//
// The Mixed object definition
//
export const Mixed = {
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
