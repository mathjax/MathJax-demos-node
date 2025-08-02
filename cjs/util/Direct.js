/*************************************************************************
 *
 *  cjs/util/Direct.js
 *
 *  Utilities for MathJax v4 command-line tools using direct access to
 *  the MathJax modules.
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
// Load the MathJax modules directly
//
const {mathjax} = require('@mathjax/src/js/mathjax.js');
const {RegisterHTMLHandler} = require('@mathjax/src/js/handlers/html.js');
const {SpeechHandler} = require('@mathjax/src/js/a11y/speech.js');
const {MathML} = require('@mathjax/src/js/input/mathml.js');

require('@mathjax/src/js/util/asyncLoad/node.js');

const {Util} = require('./Util.js');
Util.direct = true;

/**
 * The Direct utility object.
 */
const Direct = exports.Direct = {
  /**
   * Obtain a MathDocument using the given jax and options.
   *
   * @param {InputJax} input    The input jax instance to use
   * @param {OutputJax} input   The output jax instance to use
   * @param {OptionList} args   The command-line options
   * @returns {MathDocument}    The constructed MathDocument
   */
  document(input, output, args) {
    const sre = !!(args.speech || args.braille);

    //
    // Create DOM adaptor and register it for HTML documents.
    //
    const handler = RegisterHTMLHandler(Util.adaptor(args));
    if (sre) SpeechHandler(handler, new MathML());

    //
    // Create the MathDocument with the input and output jax.
    //
    const document = mathjax.document(args.file || '', {
      ...Util.config.options(args, sre),
      InputJax: input,
      OutputJax: output,
    });

    //
    // Run any ready actions my hand (since we are not using the
    // loader or startup modules)
    //
    Util.runHooks('ready', args, document);

    //
    // Return the MathDocument
    //
    return document;
  },

  /**
   * The hooks needed for this utility.
   */
  hooks: {
    /**
     * @param {OptionList} args   The command-line options
     */
    args(args) {
      //
      // Load the font, if it is not the default one.
      //
      if (args.font && args.font !== 'mathjax-newcm') {
        Util.fontData = Object.values(Util.import(`@mathjax/${args.font}-font/js/${args.output}.js`))[0];
      }
      //
      // Create the adaptor() function (alternate DOMs provide their own versions
      //
      if (!Util.altDOM) {
        const {liteAdaptor} = Util.import('@mathjax/src/js/adaptors/liteAdaptor.js');
        Util.adaptor = (args) => Util.adjustAdaptor(liteAdaptor(Util.config.adaptor(args)), args);
      }
    },
  }
};
