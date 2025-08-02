/*************************************************************************
 *
 *  mjs/util/Typeset.js
 *
 *  Utilities for MathJax v4 generic typesetting command-line tools.
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
import {Tex} from '../util/Tex.js';
import {Mml} from '../util/Mml.js';
import {Am} from '../util/Am.js';
import {Chtml} from '../util/Chtml.js';
import {Svg} from '../util/Svg.js';
import {Sre} from '../util/Sre.js';

Util.all = true;          // Indicates we are using all options
Util.hooks.typeset = [];  // Hooks for adjusting the typeset configuration

/**
 * The Typeset utility object (for use in the typeset scripts).
 */
export const Typeset = {
  /**
   * Group options under this name.
   */
  group: 'Main Options',

  /**
   * A mapping of jax name to util library.
   */
  util: {
    tex: Tex,
    mml: Mml.input,
    asciimath: Am,
    chtml: Chtml,
    svg: Svg,
  },

  /**
   * A mapping of jax name to jax class name.
   */
  jax: {
    tex: 'TeX',
    mml: 'MathML',
    asciimath: 'AsciiMath',
    chtml: 'CHTML',
    svg: 'SVG',
  },

  /**
   * The main options (input, output, file).
   */
  options() {
    return {
      input: {
        alias: 'i',
        demandOption: true,
        requiresArg: true,
        choices: ['tex', 'mml', 'asciimath'],
        describe: 'The input format.',
      },
      output: {
        alias: 'o',
        demandOption: true,
        requiresArg: true,
        choices: ['chtml', 'svg', 'mml'],
        describe: 'The output format.',
      },
      ...Util.options.file,
    };
  },

  /**
   * Function to create the input and output jax.
   */
  create: {
    /**
     * @param {OptionList} args   The command-line options
     * @returns {InputJax}        The input jax instance for the requested format
     */
    async input(args) {
      const name = args.input === 'mml' ? 'mathml' : args.input;
      const jax = (await Util.import(`@mathjax/src/js/input/${name}.js`))[Typeset.jax[args.input]];
      if (args.input === 'asciimath') {
        Am.AsciiMath = jax;
      }
      return new jax(Typeset.util[args.input].config(args, jax));
    },

    /**
     * @param {OptionList} args   The command-line options
     * @returns {OutputJax}       The output jax instance for the requested format
     */
    async output(args) {
      const name = args.output;
      //
      // The mml output doesn't use an output jax
      //
      if (name === 'mml') {
        Typeset.util.mml = Mml;
        return null;
      }
      const jax = (await Util.import(`@mathjax/src/js/output/${name}.js`))[Typeset.jax[name]];
      return new jax(Typeset.util[args.output].config(args));
    }
  },

  /**
   * Get the MathML visitor, if there is one.
   *
   * @param {OptionList} args   The command-line options
   * @returns {MmlVisitor}      The MathML serializer, if there is one
   */
  visitor(args) {
    return args.output === 'mml' ? Mml.output.visitor : undefined;
  },

  /**
   * The hooks needed for this utility.
   */
  hooks: {
    /**
     * @param {OptionList} args   The command-line options
     */
    async args(args) {
      //
      // If we are a mixed direct-component tool, load the input and output jax
      //
      if (Util.mixed) {
        const {Loader} = await Util.import('@mathjax/src/js/components/loader.js');
        await Util.import(`@mathjax/src/components/js/input/${args.input}/${args.input}.js`);
        Loader.preLoaded(`input/${args.input}`);
        if (args.output !== 'mml') {
          await Util.import(`@mathjax/src/components/js/output/${args.output}/${args.output}.js`);
          Loader.preLoaded(`output/${args.output}`);
        }
      }
    }
  },

  /**
   * Get the options that will be passed to the document.converPromise() call.
   *
   * @param {OptionList} args   The command-line options
   * @returns {OptionList}      The conversion options
   */
  convertOptions(args) {
    const options = Util.convertOptions(args);
    options.format = this.jax[args.input];
    return options;
  },

  /**
   * Get the MathJax configuration based on the command-line options.
   *
   * @param {OptionList} args   The command-line options
   * @returns {OptionList}      The MathJax configuration object
   */
  config(args) {
    const mml = args.output === 'mml';
    const sre = args.speech || args.braille;

    //
    // Get the array of components to load:
    //   the input jax
    //   the output jax (if not MathML output)
    //   the speech component if speech or braille specified
    //   the liteDOM if not already configured
    //
    const load = [
      `input/${args.input}`,
      !mml ? [`output/${args.output}`] : [],
      sre ? ['a11y/speech'] : [],
      typeof MathJax !== 'undefined' && MathJax.init ? [] : ['adaptors/liteDOM'],
    ].flat();

    //
    // Construct the basic configuration.
    //
    const config = {
      options: Util.config.options(args, sre),
      loader: Util.config.loader(load, args),
      startup: Util.config.startup(args, args.file),
    };

    //
    // Add the input and output blocks.
    //
    config[args.input] = this.util[args.input].config(args);
    this.util.mml = Mml.output;
    config[args.output] = this.util[args.output].config(args);
    this.util.mml = Mml;

    //
    // Run the typeset configuration hooks
    //
    Util.runHooks('typeset', args, config);

    //
    // Return the configuration
    //
    return config;
  },
};
