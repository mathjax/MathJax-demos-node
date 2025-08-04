/*************************************************************************
 *
 *  cjs/util/Chtml.js
 *
 *  Utilities for MathJax v4 command-line tools using CHTML output.
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

const {Util} = require('./Util.js');

/**
 * The CHTML utility object.
 */
const Chtml = exports.Chtml = {
  /**
   * Group options under this name.
   */
  group: 'CHTML Output',

  /**
   * Associated output jax.
   */
  output: 'chtml',

  /**
   * The command-line arguments for CHTML output
   */
  options() {
    const options = {
      ...Util.options.output,
      fontURL: {
        default: 'https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font@4.0.0-rc.4/chtml/woff2',
        describe: 'The URL to use for web fonts.',
      },
      css: {
        boolean: true,
        default: false,
        describe: 'Include the needed CSS in the output.',
      },
    };
    return options;
  },

  /**
   * The MathJax configuration options for the CHTML output jax.
   *
   * @param {OptionList} args   The command-line options
   */
  config(args) {
    return {
      ...Util.config.output(args),
      fontURL: args.fontURL,
    };
  },

  /**
   * Filter CHTML output based on the command-line options.
   *
   * @param {LiteElement} node        The output node to filter
   * @param {OptionList} args         The command-line options
   * @param {boolean} css             True to include CSS output, if requested
   * @param {MathDocument} document   The MathDocument containing the node
   * @returns {string}                The serialized CSS and HTML.
   */
  filter(node, args, css = true, document = MathJax.startup.document) {
    const adaptor = document.adaptor;
    //
    // Filter any attributes and add speech, as requested.
    //
    if (node) {
      Util.filterNode(adaptor, node, args);
      Util.addSpeech(adaptor, node, args);
    }
    //
    // Get the CSS to add, if requested.
    //
    let CSS = '';
    if (css && args.css) {
      const sheet = document.outputJax.styleSheet(document);
      CSS = '<style>' + adaptor.textContent(sheet).replace(/\n\n/g, '\n') + '</style>';
    }
    //
    // Return the CSS followed by the zerialized output.
    //
    return CSS + (node ? adaptor.outerHTML(node) : '');
  },

  /**
   * Filter CHTML output for a whole document.
   *
   * @param {OptionList} args      The command-line options
   * @param {MathDocument} html    The MathDocument to filter
   * @returns {string}             The serialized filtered document
   */
  filterPage(args, html = MathJax.startup.document) {
    const adaptor = html.adaptor;
    //
    //  Get the list of MathItems in the document.
    //
    const list = Array.from(html.math);
    if (list.length === 0) {
      //
      // Remove the stylesheet of there are no expressions on the page.
      //
      adaptor.remove(html.outputJax.chtmlStyles);
    } else {
      //
      // Loop through the MathItems and filter the attributes.
      // Add any speech that was found.
      //
      for (const math of list) {
        args._speech = args._braille = '';
        Util.filterNode(adaptor, math.typesetRoot, args);
        Util.addSpeech(adaptor, math.typesetRoot, args);
      }
    }
    //
    // Return the serialized document.
    //
    const doctype = adaptor.doctype(html.document);
    return (doctype ? doctype + '\n' : '') + adaptor.outerHTML(adaptor.root(html.document));
  },
};
