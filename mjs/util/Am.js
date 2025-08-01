/*************************************************************************
 *
 *  mjs/util/Am.js
 *
 *  Utilities for MathJax v4 command-line tools using AsciiMath.
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
 * The AssciiMath utility object.
 */
export const Am = {
  /**
   * When Direct calls are made, this is set to the AsciiMath class.
   */
  AsciiMath: undefined,

  /**
   * Group options under this name.
   */
  group: 'AsciiMath Input',

  /**
   * The command-line arguments for AsciiMath input
   */
  options(options) {
    return {
      ...Util.options.input(),
      'allow-inline': {
        boolean: true,
        default: false,
        describe: 'Use separate inline `...` and display ``...`` delimiters.',
      }
    };
  },

  /**
   * The MathJax configuration options for the AsciiMath input jax
   *
   * @param {OptionList} args   The command-line options
   */
  config(args) {
    if (!args['allow-inline']) return {};
    //
    // When allow-inline is specified, we overreide the AsciiMath input jax's
    // compile function in order to handle the inline vs. display rendering.
    //
    Util.addHook('ready', () => {
      Am.AsciiMath ??= MathJax._.input.asciimath_ts.AsciiMath;
      Object.assign(Am.AsciiMath.prototype, {
        _compile: Am.AsciiMath.prototype.compile,
        compile(math, document) {
          //
          // Compile the expression
          //
          math.display = (math.start?.delim === '``');
          const result = this._compile(math, document);
          //
          // Remove the mstyle that AsciiMath creates and move its
          // children to the math node.
          //
          const mstyle = result.childNodes[0].childNodes.pop();
          mstyle.childNodes.forEach(child => result.appendChild(child));
          //
          // Set the display style if needed.
          //
          if (math.display) {
            result.attributes.set('display', 'block');
          }
          return result;
        }
      });
    });
    //
    // Set the delimiters to use for AsciiMath.
    //
    return {
      delimiters: [['``', '``'], ['`', '`']],
    };
  },
};
