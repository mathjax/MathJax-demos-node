/*************************************************************************
 *
 *  mjs/util/Mml.js
 *
 *  Utilities for MathJax v4 command-line tools using MathML input and
 *  output.
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
 * The Mml utility object.
 */
export const Mml = {
  /**
   * Definitions for MathML input.
   */
  input: {
    /**
     * Group options under this name.
     */
    group: 'MathML Input',

    /**
     * The command-line arguments for MathML input.
     */
    options() {
      return {
        ...Util.options.input(),
        mml3: {
          boolean: true,
          default: false,
          description: 'Include the experimental mml3 extension.',
        },
        'mml-html': {
          boolean: true,
          default: false,
          description: 'Allow HTML in MathML token nodes.'
        },
      };
    },

    /**
     * The MathJax configuration options for the Mml input jax.
     *
     * @param {OptionList} args   The command-line options
     */
    config(args) {
      return {
        allowHtmlInTokenNodes: args['mml-html'],
      };
    },

    /**
     * The hooks needed for this MathML input.
     */
    hooks: {
      /**
       * @param {OptionList} args   The command-line options
       */
      async args(args) {
        //
        // Load the mml3 input, if needed, for direct module access.
        //
        if (Util.direct && args.mml3) {
          await Util.import(`@mathjax/src/mjs/input/mathml/mml3/mml3.js`);
        }
      },

      /**
       * @param {OptionList} args         The command-line options
       * @param {MathDocument} document   The MathDocument in use
       */
      ready(args, document) {
        //
        // Find definition of mError function in the prototype chain
        // and replace it with one that prints the error and
        // exits if errors are fatal.
        //
        let proto = document.mmlFactory.create('math').__proto__;
        while (proto) {
          if (Object.hasOwn(proto, 'mError')) {
            Object.assign(proto, {
              _mError_: proto.mError,
              mError(message, options, short = true) {
                Util.error(message, args);
                return this._mError_(message, options, short);
              }
            });
            break;
          }
          proto = proto.__proto__;
        }
      },

      /**
       * @param {OptionList} args     The command-line options
       * @param {OptionList} config   The current Loader configuration
       */
      loader(args, config) {
        //
        // Load the mml3 extension, if requested.
        //
        if (args.mml3) {
          config.load.push('[mml]/mml3');
        }
      },
    },
  },

  /**
   * Definitions for MathML output.
   */
  output: {
    /**
     * Group options under this name.
     */
    group: 'MathML Output',

    /**
     * Associated output jax.
     */
    output: 'mml',

    /**
     * The command-line arguments for MathML output.
     */
    options() {
      return {
        'mml-core': {
          boolean: true,
          default: false,
          describe: 'Convert mathvariants to Unicode Math Aphanumeric codes.',
        },
      };
    },

    /**
     * Configuration for MathML output (none).
     */
    config() {
      return {};
    },

    /**
     * The hooks needed for this MathML output.
     */
    hooks: {
      /**
       * @param {OptionList} args   The command-line options
       */
      async args(args) {
        //
        // Set up the MathML serialization visitor, if needed.
        //
        if (Util.direct) {
          const {SerializedMmlVisitor} = await Util.import('@mathjax/src/mjs/core/MmlTree/SerializedMmlVisitor.js');
          Mml.output.visitor = new SerializedMmlVisitor();
        }
      },

      /**
       * @param {OptionList} args         The command-line options
       * @param {MathDocument} document   The MathDocument in use
       */
      ready(options, document) {
        //
        // If we are translating mathvariant attributes, add the filter to all input jax.
        //
        if (options['mml-core']) {
          for (const jax of document.inputJax) {
            jax.postFilters.add(({data}) => Mml.unicodeVariants(data.root || data));
          }
        }
      },

      /**
       * @param {OptionList} args     The command-line options
       * @param {OptionList} config   The current option configuration block
       */
      options(args, config) {
        //
        // If we are processing files for MathML output, add a render action
        // to do the rendering to MathML.
        //
        if (args.file && args.output === 'mml') {
          Object.assign(config, {
            renderActions: {
              typeset: [
                150,
                (doc) => {for (const math of doc.math) {Mml.renderMathML(math, doc, Mml.output.visitor)}},
                (math, doc) => Mml.renderMathML(math, doc, Mml.output.visitor)
              ]
            },
          });
        }
      },
    },

    /**
     * The MathML serializer visitor, when needed.
     */
    visitor: undefined,
  },

  /**
   * The numeric ranges for numbers, uppercase alphabet, lowercase alphabet,
   * uppercase Greek, and lowercase Greek, with optional remapping of some
   * characters into the (relative) positions used in the Math Alphanumeric block.
   */
  ranges: [
    [0x30, 0x39],
    [0x41, 0x5A],
    [0x61, 0x7A],
    [0x391, 0x3A9, {0x3F4: 0x3A2, 0x2207: 0x3AA}],
    [0x3B1, 0x3C9, {0x2202: 0x3CA, 0x3F5: 0x3CB, 0x3D1: 0x3CC,
                    0x3F0: 0x3CD, 0x3D5: 0x3CE, 0x3F1: 0x3CF, 0x3D6: 0x3D0}],
  ],

  /**
   * The starting values for numbers, Alpha, alpha, Greek, and greek for the variants
   */
  variants: {
    bold: [0x1D7CE, 0x1D400, 0x1D41A, 0x1D6A8, 0x1D6C2],
    italic: [0, 0x1D434, 0x1D44E, 0x1D6E2, 0x1D6FC, {0x68: 0x210E}],
    'bold-italic': [0, 0x1D468, 0x1D482, 0x1D71C, 0x1D736],
    script: [0, 0x1D49C, 0x1D4B6, 0, 0, {
      0x42: 0x212C, 0x45: 0x2130, 0x46: 0x2131, 0x48: 0x210B, 0x49: 0x2110,
      0x4C: 0x2112, 0x4D: 0x2133, 0x52: 0x211B, 0x65: 0x212F, 0x67: 0x210A,
      0x6F: 0x2134,
    }],
    'bold-script': [0, 0x1D4D0, 0x1D4EA, 0, 0],
    fraktur: [0, 0x1D504, 0x1D51E, 0, 0, {
      0x43: 0x212D, 0x48: 0x210C, 0x49: 0x2111, 0x52: 0x211C, 0x5A: 0x2128,
    }],
    'bold-fraktur': [0, 0x1D56C, 0x1D586, 0, 0],
    'double-struck': [0x1D7D8, 0x1D538, 0x1D552, 0, 0, {
      0x43: 0x2102, 0x48: 0x210D, 0x4E: 0x2115, 0x50: 0x2119, 0x51: 0x211A,
      0x52: 0x211D, 0x5A: 0x2124,
      0x393: 0x213E, 0x3A0: 0x213F, 0x3B3: 0x213D, 0x3C0: 0x213C,
    }],
    'sans-serif': [0x1D7E2, 0x1D5A0, 0x1D5BA, 0, 0],
    'bold-sans-serif': [0x1D7EC, 0x1D5D4, 0x1D5EE, 0x1D756, 0x1D770],
    'sans-serif-italic': [0, 0x1D608, 0x1D622, 0, 0],
    'sans-serif-bold-italic': [0, 0x1D63C, 0x1D656, 0x1D790, 0x1D7AA],
    monospace: [0x1D7F6, 0x1D670, 0x1D68A, 0, 0],
    '-tex-calligraphic': [0, 0x1D49C, 0x1D4B6, 0, 0, {
      0x42: 0x212C, 0x45: 0x2130, 0x46: 0x2131, 0x48: 0x210B, 0x49: 0x2110,
      0x4C: 0x2112, 0x4D: 0x2133, 0x52: 0x211B, 0x65: 0x212F, 0x67: 0x210A,
      0x6F: 0x2134,
    }, '\uFE00'],
    '-tex-bold-calligraphic': [0, 0x1D4D0, 0x1D4EA, 0, 0, {}, '\uFE00'],
  },

  /**
   * Styles to use for characters that can' tbe translated.
   */
  variantStyles: {
    bold: 'font-weight: bold',
    italic: 'font-style: italic',
    'bold-italic': 'font-weight; bold; font-style: italic',
    'script': 'font-family: script',
    'bold-script': 'font-family: script; font-weight: bold',
    'sans-serif': 'font-family: sans-serif',
    'bold-sans-serif': 'font-family: sans-serif; font-weight: bold',
    'sans-serif-italic': 'font-family: sans-serif; font-style: italic',
    'sans-serif-bold-italic': 'font-family: sans-serif; font-weight: bold; font-style: italic',
    'monospace': 'font-family: monospace',
    '-tex-mathit': 'font-style: italic',
  },

  /**
   * Convert mathvariants to Unicode MathAlphanumerics.
   *
   * @param {MmlNode} root   The internal-format math node whose tree is
   *                         to be processed
   */
  unicodeVariants(root) {
    //
    // Walk the MathML tree for token nodes with mathvariant attributes.
    //
    root.walkTree((node) => {
      if (!node.isToken || !node.attributes.isSet('mathvariant')) return;
      //
      // Get the variant and the unicode characters of the element.
      //
      const variant =
            node.attributes.get('data-mjx-variant') ?? node.attributes.get('mathvariant');
      const text = [...node.getText()];
      //
      // Skip the only valid case in MathML-Core and any invalid variants.
      //
      if (variant === 'normal' && node.isKind('mi') && text.length === 1) return;
      node.attributes.unset('mathvariant');
      node.attributes.unset('data-mjx-mathvariant');
      if (!Object.hasOwn(this.variants, variant)) return;
      //
      // Get the variant data.
      //
      const start = this.variants[variant];
      const remap = start[5] || {};
      const modifier = start[6] || '';
      //
      // Convert the text of the child nodes.
      //
      let converted = true;
      for (const child of node.childNodes) {
        if (child.isKind('text')) {
          converted &= this.convertText(child, start, remap, modifier);
        }
      }
      //
      // If not all characters were converted, add styles, if possible,
      // but not when it would already be in italics.
      //
      if (!converted &&
          !(['italic', '-tex-mathit'].includes(variant) && text.length === 1 && node.isKind('mi'))) {
        this.addStyles(node, variant);
      }
    });
  },

  /**
   *  Convert the content of a text node to Math Alphanumerics.
   *
   * @param {MmlNode} node     The text node to convert
   * @param {number[]} start   The starting positions for the character classes
   *                           for this variant
   * @param {object} remap     Special character remapping
   * @param {string} modifier  The modifier character to add (for Calligraphic)
   */
  convertText(node, start, remap, modifier) {
    //
    // Get the text.
    //
    const text = [...node.getText()]
    //
    // Loop through the characters in the text.
    //
    let converted = 0;
    for (let i = 0; i < text.length; i++) {
      let C = text[i].codePointAt(0);
      //
      // Check if the character is in one of the ranges.
      //
      for (const j of [0, 1, 2, 3, 4]) {
        const [m, M, map = {}] = this.ranges[j];
        if (!start[j]) continue;
        if (C < m) break;
        //
        // Set the new character based on the remappings and
        // starting location for the range.
        //
        if (map[C]) {
          text[i] = String.fromCodePoint(map[C] - m + start[j]) + modifier;
          converted++;
          break;
        } else if (remap[C] || C <= M) {
          text[i] = String.fromCodePoint(remap[C] || C - m + start[j]) + modifier;
          converted++;
          break;
        }
      }
    }
    //
    // Put back the modified text content.
    //
    node.setText(text.join(''));
    //
    // Return true if all characters were converted, false otherwise.
    //
    return converted === text.length;
  },

  /**
   * Add styles when conversion isn't possible.
   *
   * @param {MmlNode} node     The element to get the styles
   * @param {string} variant   The variant for that node
   */
  addStyles(node, variant) {
    let styles = this.variantStyles[variant];
    if (styles) {
      if (node.attributes.hasExplicit(styles)) {
        styles = node.attributes.get('style') + ' ' + styles;
      }
      node.attributes.set('style', styles);
    }
  },

  /**
   * A renderAction to take the place of typesetting.
   * It renders the output to MathML instead.
   *
   * @param {MathItem} math        The MathItem to be typeset as MathML
   * @param {doc} MathDocument     The MathDocument containing the MathItem
   * @param {MmlVisitor} visitor   A MathML serialization visitor
   */
  renderMathML(math, doc, visitor = MathJax.startup.visitor) {
    const adaptor = doc.adaptor;
    if (math.display === null) {
      math.typesetRoot = adaptor.node('span', {}, [adaptor.text(math.math)]);
    } else {
      const mml = visitor.visitTree(math.root, doc);
      math.typesetRoot = adaptor.firstChild(adaptor.body(adaptor.parse(mml, 'text/html')))
    }
  },

  /**
   * Convert math of a given type to internal MathML form.
   *
   * @param {string} type          The input format to use
   * @param {string} math          The expression to be typeset as MathML
   * @param {OPtionList} options   The conversion options to use
   * @param {doc} MathDocument     The MathDocument to use to process the math
   * @returns {MmlNode}            The internal math node for the converted expression
   */
  convert2mmlPromise(type, math, options, doc = MathJax.startup.document) {
    const END = typeof MathJax === 'undefined' ? 100 : MathJax._.core.MathItem.STATE.CONVERT;
    options = {...options, format: type, end: END};
    return doc.convertPromise(math, options);
  },

  /**
   * Filter MML output based on the command-line options.
   *
   * @param {LiteElement} node        The output node to filter
   * @param {OptionList} args      The command-line options
   * @param {boolean} _               True to include CSS output, if requested (unused for MathML)
   * @param {MathDocument} document   The MathDocument containing the node
   * @returns {string}                The serialized CSS and HTML.
   */ 
  filter(mml, args, _ = true, doc = MathJax.startup.document, mmlVisitor = MathJax.startup.visitor) {
    //
    // Remove unwanted attributes.
    //
    const data = {};
    mml.walkTree((node) => {
      const attributes = node.attributes;
      if (!attributes) return;
      //
      // Filter the attributes.
      //
      for (const name of attributes.getExplicitNames()) {
        //
        // Save the first speech and braille attributes (should be for the full expression).
        //
        if (args.speech && !args._speech && name === 'data-semantic-speech-none') {
          data.speech = attributes.get(name);
        }
        if (args.braille && !args._braille && name === 'data-semantic-braille') {
          data.braille = attributes.get(name);
        }
        //
        // Remove the latex and data-semantic attributes, if requested.
        //
        if ((!args['include-latex'] && (name == 'data-latex' || name === 'data-latex-item')) ||
            (!args.semantics &&
             name.match(/^(?:data-semantic-.*|data-speech-node|data-(?:speech|braille)-attached)$/))) {
          attributes.unset(name);
        }
      }
    });
    //
    // Add speech and braille, if any, and hide children.
    //
    if (data.speech) {
      html.attribnutes.set('aria-label', data.speech);
    }
    if (data.braille) {
      html.attributes.set('aria-braillelabel', data.braille);
    }
    if (data.speech || data.braille) {
      for (const child of node.childNodes) {
        child.attributes.set('aria-hidden', 'true');
      }
    }
    //
    // Get the serialized MathML.
    //
    if (!args.entities) {
      mmlVisitor.toEntity = (c) => c;
    }
    return mmlVisitor.visitTree(mml, doc);
  },

  /**
   * Filter MML output for a whole document.
   *
   * @param {OptionList} args      The command-line options
   * @param {MathDocument} html    The MathDocument to filter
   * @returns {string}             The serialized filtered document
   */
  filterPage(args, html = MathJax.startup.document) {
    const adaptor = html.adaptor;
    //
    // Loop through the MathItems and filter the attributes.
    // Add any speech that was found.
    //
    for (const math of Array.from(html.math)) {
      args._speech = args._braille = '';
      Util.filterNode(adaptor, math.typesetRoot, args);
      Util.addSpeech(adaptor, math.typesetRoot, args);
    }
    //
    // Return the serialized document
    //
    const doctype = adaptor.doctype(html.document);
    return (doctype ? doctype + '\n' : '') + adaptor.outerHTML(adaptor.root(html.document));
  }
};
