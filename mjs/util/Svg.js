/*************************************************************************
 *
 *  mjs/util/Svg.js
 *
 *  Utilities for MathJax v4 command-line tools using SVG output.
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

import {Util} from './Util.js';

/**
 * The Svg utility obejct.
 */
export const Svg = {
  /**
   * Group options under this name.
   */
  group: 'SVG Output',

  /**
   * Associated output jax.
   */
  output: 'svg',

  /**
   * Minimal CSS needed for a stand-alone SVG image from MathJax.
   */
  CSS: [
    'svg a{fill:blue;stroke:blue}',
    '[data-mml-node="merror"]>g{fill:red;stroke:red}',
    '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
    '[data-frame],[data-line]{stroke-width:70px;fill:none}',
    '.mjx-dashed{stroke-dasharray:140}',
    '.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}',
    'use[data-c]{stroke-width:3px}'
  ].join(''),

  /**
   * The command-line arguments for SVG output.
   */
  options() {
    const options = {
      ...Util.options.output,
      'font-cache': {
        alias: 'C',
        default: 'auto',
        requiresArg: true,
        choices: ['auto', 'local', 'global', 'none'],
        describe: 'Type of font cache to use.',
      },
      color: {
        default: 'currentColor',
        describe: 'The initial color to use.',
      },
      xlink: {
        boolean: true,
        default: false,
        describe: 'Use xlink namespaces for href attributes.',
      },
      styles: {
        boolean: true,
        default: true,
        describe: 'Include css styles for stand-alone image.',
      },
      container: {
        boolean: true,
        describe: 'Include <mjx-container> element.',
      },
    };
    return options;
  },

  /**
   * The MathJax configuration options for the SVG output jax.
   *
   * @param {OptionList} args   The command-line options
   */
  config(args) {
    //
    // Set the font cache to gobal for files and local for equations.
    //
    if (args['font-cache'] === 'auto') {
      args['font-cache'] = args.file ? 'global' : 'local';
    }
    return {
      ...Util.config.output(args),
      fontCache: args['font-cache'],
      useXlink: args.xlink,
    };
  },

  /**
   * Filter SVG output based on the command-line options
   *
   * @param {LiteElement} node        The output node to filter
   * @param {OptionList} args         The command-line options
   * @param {boolean} defs            True to include the global <defs> object, if any
   * @param {MathDocument} document   The MathDocument containing the node
   * @returns {string}                The serialized CSS and HTML.
   */
  filter(node, args, defs = true, document = MathJax.startup.document) {
    const adaptor = document.adaptor;
    let SVG = '';  // Eventaully, the serialized SVG.
    if (node) {
      //
      // Filter any attributes and add speech, as requested.
      //
      const svg = adaptor.getElement('svg', node);
      Util.filterNode(adaptor, node, args);
      Util.addSpeech(adaptor, svg, args);
      //
      // Serialize the mjx-container, if requested, otherwise the SVG element,
      // and set the color to use for the math.
      //
      SVG = args.container ? adaptor.outerHTML(node) : adaptor.serializeXML(svg);
      SVG = SVG.replace(/currentColor/g, args.color);
    }
    //
    // Get the global <defs> element, if needed.
    let DEFS = '';
    if (defs && args['font-cache'] === 'global') {
      const global = document.outputJax.fontCache.defs;
      DEFS = '<svg>' + adaptor.serializeXML(global).replace(/(<path|<\/defs)/g, '\n$1') + '</svg>';
    }
    //
    // Return the defs plus the SVG output.
    //
    return DEFS + SVG;
  },

  /**
   * Filter SVG output for a whole document
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
      // Remove the stylesheet and font cache, if there are no expressions on the page.
      //
      adaptor.remove(html.outputJax.svgStyles);
      const cache = adaptor.elementById(adaptor.body(html.document), 'MJX-SVG-global-cache');
      if (cache) adaptor.remove(cache);
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
