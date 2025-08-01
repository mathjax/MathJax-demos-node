/*************************************************************************
 *
 *  mjs/util/Tex.js
 *
 *  Utilities for MathJax v4 command-line tools using TeX input.
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

//
// These are used to load the extensions as direct modules
//
import {mjxRoot} from '@mathjax/src/js/components/mjs/root.js';
import {readdirSync, existsSync} from 'node:fs';

/**
 * The TeX utility object.
 */
export const Tex = {
  /**
   * Group options under this name.
   */
  group: 'TeX Input',

  /**
   * The default TeX packages to use.
   */
  basePackages: 'base, ams, newcommand, textmacros',
  extraPackages: ', require, autoload',

  /**
   * The list of packages to load based on the --packages option.
   */
  loads: [],

  /**
   * The command-line arguments for TeX input.
   */
  options() {
    this.packages = this.basePackages + (Util.direct && !Util.mixed ? '' : this.extraPackages);
    return {
      inline: {
        alias: 'I',
        boolean: true,
        describe: 'Process equations as inline math.',
      },
      packages: {
        alias: 'P',
        default: this.packages,
        describe: 'The packages to use, e.g. "base, ams"; ' +
          'use "*" to represent the default packages, e.g, "*, bbox".',
      },
      'include-latex': {
        alias: 'L',
        boolean: true,
        default: false,
        describe: 'Include data-latex attributes (true) or not (false).',
      },
      'tex-errors': {
        alias: 'E',
        boolean: true,
        default: true,
        describe: 'TeX errors are reportred rather than processed.',
      },
      'tex-html': {
        boolean: true,
        default: false,
        describe: 'Allow HTML in TeX.',
      },
      ...Util.options.input(),
      dollars: {
        boolean: true,
        default: false,
        describe: 'Use single dollar signs for inline math delimiters in files.',
      },
    };
  },

  /**
   * The MathJax configuration options for the TeX input jax.
   *
   * @param {OptionList} args   The command-line options
   */
  config(args) {
    const config = {
      packages: args.packages,
      formatError: (jax, err) => {
        if (args['tex-errors']) {
          Util.error(err, args);
        }
        return jax.formatError(err);
      },
    };
    if (args.dollars) {
      config.inlineMath = {'[+]': [['$', '$']]};
    }
    if (args['tex-html']) {
      config.allowTexHTML = true;
    }
    return config;
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
      // Get the package list.
      //
      args.packages = args.packages.replace('\*', Tex.packages).split(/\s*,\s*/);
      if (args['tex-html']) {
        args.packages.push('texhtml');
      }
      //
      // For direct module access, load the packages, otherise set the load array.
      //
      await (Util.direct ? Tex.loadDirect(args) : Tex.loadComponents(args));
    },

    /**
     * @param {OptionList} _args    The command-line options (not used)
     * @param {OptionList} config   The current Loader configuration
     */
    loader(_args, config) {
      //
      // Add any packages that need to be loaded.
      //
      if (Tex.loads.length) {
        config.load.push(...Tex.loads);
      }
    }
  },

  /**
   * Load the needed modules directly.
   *
   * @param {OptionList} args   The command-line options
   */
  loadDirect(args) {
    //
    // Get the tex input jax directory.
    //
    const root = mjxRoot().replace(/bundle$/, 'mjs/input/tex');
    //
    // A list of promises for when the packages are loaded.
    //
    const promises = [];
    //
    // Loop through the packages and look through their directories
    // for the configuration file.  Load the package and push its
    // promise to the list.
    //
    for (const name of args.packages) {
      const dir = `${root}/${name}`;
      if (existsSync(dir)) {
        const file = readdirSync(dir).find((name) => name.endsWith('Configuration.js'));
        promises.push(Util.import(`${dir}/${file}`));
      } else {
        Uti.error(`Unknown TeX package: ${name}`);
      }
    }
    //
    // Return a promise that resolves when all the packages are loaded.
    //
    return Promise.all(promises);
  },

  /**
   * Set the load array for the needed packages.
   *
   * @param {OptionList} args   The command-line options
   */
  loadComponents(args) {
    //
    // The default package list (which are preloaded).
    //
    const packages = this.packages.split(/\s*,\s*/);
    //
    // Filter the user's package list to remove the pre-loaded ones,
    // and create the needed names for them to be loaded.
    //
    this.loads = args.packages.filter((name) => !packages.includes(name)).map((name) => `[tex]/${name}`);
  },
};
