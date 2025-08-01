/*************************************************************************
 *
 *  mjs/util/Sre.js
 *
 *  Utilities for MathJax v4 command-line tools using SRE.
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
 * The Sre utility object.
 */
export const Sre = {
  /**
   * Group options under this name.
   */
  group: 'Accessibility',

  /**
   * The command-line arguments for SRE
   */
  options() {
    return {
      speech: {
        alias: 'S',
        boolean: true,
        default: false,
        describe: 'Whether to include speech labels.',
      },
      braille: {
        alias: 'B',
        boolean: true,
        default: false,
        describe: 'Whether to include braille labels.',
      },
      sre: {
        array: true,
        nargs: 2,
        describe: 'SRE flags as key value pairs, e.g., "--sre locale de --sre domain mathspeak" ' +
          'generates speech in German with mathspeak rules.',
      },
      semantics: {
        boolean: true,
        default: false,
        describe: 'Keep the data-semantic attributes.',
      },
    };
  },

  /**
   * The MathJax configuration options for SRE from --sre option.
   *
   * @param {OptionList} args   The command-line options
   */
  config(args) {
    const config = {};
    if (args.sre) {
      //
      // Make a configuration block from the --sre values.
      //
      for (let i = 0, key; key = args.sre[i]; i++) {
        let value = args.sre[++i];
        config[key] = value || false;
      }
    }
    return config;
  },

  /**
   * The hooks needed for this MathML input.
   */
  hooks: {
    /**
     * @param {OptionList} args     The command-line options
     * @param {OptionList} config   The current option configuration block
     * @param {boolean} sre         True if SRE is to be configured
     */
    options(args, config, sre) {
      //
      // If we are allowed to have speech (i.e., not MathML output),
      // and either speech or braille is requested, or we are not not
      // a typeset tool (in which case speech is always loaded), then
      // add the speech controls and sre configuration.
      //
      if (sre && (!Util.all || args.speech || args.braille)) {
        Object.assign(config, {
          enableSpeech: args.speech,
          enableBraille: args.braille,
          sre: Sre.config(args),
        });
      }
    },
  },
};
