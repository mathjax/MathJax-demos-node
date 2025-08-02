/*************************************************************************
 *
 *  mjs/util/Util.js
 *
 *  Utilities for MathJax v4 command-line tools.
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

import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * The main utility object.
 */
export const Util = {
  source: {},     // The source file map
  sre: {},        // The SRE options, when SRE is in use
  output: '',     // The default output jax
  fontData: null, // The font class to use

  direct: false,  // True for direct and mixed tools vs component-based tools
  mixed: false,   // True for mixed tools
  all: false,     // True for typeset tools

  /**
   * Hooks to be called for various actions.
   */
  hooks: {
    args: [],
    ready: [],
    loader: [],
    options: [],
  },

  /**
   * Yargs option lists.
   */
  options: {
    /**
     * The document options.
     */
    yargs() {
      const options = {
        em: {
          alias: 'm',
          default: 16,
          describe: 'Em-size in pixels.',
        },
        ex: {
          alias: 'x',
          default: 8,
          describe: 'Ex-size in pixels.',
        },
        width: {
          alias: 'w',
          default: 80 * 16,
          describe: 'Width of container in pixels.',
        },
        entities: {
          boolean: true,
          default: true,
          describe: 'Encode non-ASCII characters using HTML entities.',
        },
        'fatal-errors': {
          boolean: true,
          describe: 'Input errors are fatal.',
        },
        'full-errors': {
          boolean: true,
          default: false,
          describe: 'Show full error messages.',
        },
        quiet: {
          alias: 'q',
          boolean: true,
          default: false,
          describe: 'Don\'t print prompts.',
        },
      };
      if (!Util.direct) {
        options.dist = {
          boolean: true,
          default: false,
          describe: 'True to use webpacked files, false to use source files.',
        };
      }
      return options;
    },

    /**
     * The 'file' option.
     */
    file: {
      file: {
        alias: 'f',
        requiresArg: true,
        describe: 'Process an HTML file rather than individual equations.',
      },
    },

    /**
     * The common input options.
     */
    input() {
      return Util.all ? {} : Util.options.file;
    },

    /**
     * The common output options.
     */
    output: {
      font: {
        alias: 'F',
        default: 'mathjax-newcm',
        describe: 'The font to use (you may need to install it first).',
      },
      overflow: {
        alias: 'O',
        default: 'overflow',
        requiresArg: true,
        choices: ['overflow', 'linebreak', 'scroll', 'scale', 'truncate', 'elide'],
        description: 'How to treat wide displayed equations.',
      },
      'inline-breaks': {
        alias: 'L',
        boolean: true,
        default: false,
        describe: 'Allow line breaks in in-line math.',
      },
      align: {
        alias: 'A',
        default: 'center',
        requiresArg: true,
        choices: ['left', 'center', 'right'],
        describe: 'Displayed equation alignment.',
      },
      indent: {
        alias: 'N',
        default: '0em',
        describe: 'Displayed equation offset.',
      },
      'mml-spacing': {
        boolean: true,
        default: false,
        describe: 'True to use MathML spacing rules, false for TeX rules.',
      },
    },
  },

  /**
   * MathJax configuration blocks.
   */
  config: {
    /**
     * @param {OptionList} args      The command line options
     * @param {boolean} sre          True if sre is to be included
     * @returns {OptionList}         The options configuration block
     */
    options(args, sre = true) {
      const config = {};
      Util.runHooks('options', args, config, sre);
      return config;
    },

    /**
     * @param {string[]} load        The components to load
     * @param {OptionList} args      The command line options
     * @returns {OptionList}         The loader configuration block
     */
    loader(load, args) {
      const config = {
        failed: (err) => Util.fail(err),
        source: Util.source,
        load: load,
        require: (file) => import(file),
        paths: {
          mathjax: '@mathjax/src/bundle'
        },
      };
      Util.runHooks('loader', args, config);
      return config;
    },

    /**
     * @param {OptionList} args      The command line options
     * @returns {OptionList}         The startup configuration block
     */
    startup(args) {
      return {
        typeset: !!args.file,
        document: args.file,
        ready() {
          MathJax.startup.defaultReady();
          Util.adjustAdaptor(MathJax.startup.adaptor, args);
          Util.runHooks('ready', args, MathJax.startup.document);
        },
      };
    },

    /**
     * @param {OptionList} args      The command line options
     * @returns {OptionList}         The adaptors/liteDOM configuration block
     */
    adaptor(args) {
      return {
        fontSize: args.em,
      };
    },

    /**
     * @param {OptionList} args      The command line options
     * @returns {OptionList}         The output configuration block
     */
    output(args) {
      return {
        font: args.font,
        fontData: Util.fontData,
        dynamicPrefix: `[${args.font}]/${args.output}/dynamic`,
        exFactor: args.ex / args.em,
        displayAlign: args.align,
        displayIndent: args.indent,
        displayOverflow: args.overflow,
        linebreaks: {
          inline: args['inline-breaks'],
        },
        mathmlSpacing: args['mml-spacing'],
      }
    }
  },

  /**
   * Add a hook for a specified situation.
   *
   * @param {string} kind    The type of hook to add
   * @param {function} hook  The functino to call as the hook
   */
  addHook(kind, hook) {
    this.hooks[kind].push(hook);
  },

  /**
   * Run the hooks registered for a given type.
   *
   * @param {string} kind      The type of hook to run
   * @param {OptionList} args  The command-line options
   * @param {any[]} data       Additional data to pass to the hooks
   * @returns {Promise}        A promise that is resolved when the hooks complete
   */
  runHooks(kind, args, ...data) {
    const promises = [];
    for (const hook of this.hooks[kind]) {
      const result = hook(args, ...data);
      if (result instanceof Promise) {
        promises.push(result);
      }
    }
    return promises.length ? Promise.all(promises) : Promise.resolve();
  },
  
  /**
   * Get command-line arguments
   *
   * @param {string} usage     The usage messsage
   * @param {object[]} utils   The list of utils whose yarg options we are to use
   * @param {boolean} width    Include width option?
   * @return {OptionList}      The command-line argument list
   */
  async args(usage, utils, width = true) {
    const options = {}; // The list of yarg options 
    const groups = [];  // The groups for the options
    //
    // Process the utilities for hooks, optionts, etc.
    //
    for (const util of utils) {
      //
      // If the utility has hooks, register them.
      //
      if (util.hooks) {
        for (const [kind, hook] of Object.entries(util.hooks)) {
console.log(kind, hook.toString());
          this.addHook(kind, hook);
        }
      }
      //
      // If the utility has options, add them in, and check if
      // they should be in a named group.
      //
      if (util.options) {
        Object.assign(options, util.options());
        if (util.group) {
          groups.push([Object.keys(util.options()), util.group + ':\n']);
        }
      }
      //
      // If this is an output utility, use it as the default output.
      //
      if (util.output) {
        this.output = util.output;
      }
    }
    //
    // Add the main options.
    //
    const opts = {...this.options.yargs()};
    if (!width) delete opts.width;
    Object.assign(options, opts);
    groups.push([Object.keys(opts), 'Miscellaneous:\n']);
    groups.push([['help', 'version'], 'Information:\n']);
    //
    // Set up the options, check their values, and process the groups.
    //
    let args = yargs(hideBin(process.argv))
        .demandCommand(0).strict()
        .usage('$0 [options] ' + usage)
        .options(options)
        .alias('h', 'help')
        .alias('v', 'version')
        .check((args) => {
          if (args.file) {
            if (args._.length) {
              throw Error('You may not provide equations when a file is specified');
            }
            args.file = Util.read(args.file);
          }
          if (Array.isArray(args.file)) {
            throw Error('You may only provide a single file to process');
          }
          return true;
        });
    groups.forEach(([keys, name]) => (args = args.group(keys, name)));
    //
    // Set the output and math arguments.
    //
    args = args.argv;
    args.output ??= this.output;
    if (!args.file) {
      args.math = args._;
    }
    //
    // Load source components, if requested.
    //
    if (!args.dist) {
      this.source = (await Util.import('@mathjax/src/components/js/source.js')).source;
    }
    //
    // Run any registered hooks.
    //
    await this.runHooks('args', args);
    //
    // Return the command-line arguments
    //
    return args;
  },

  /**
   * Read a file from disk.
   *
   * @param {string} file   The path to the file to read
   * @returns {string}      The file's contents
   */
  read(file) {
    return fs.readFileSync(file === '-' || !file ? 0 : file, 'utf8');
  },

  /**
   * Load a MathJax component.
   *
   * @param {string} name      The name of the component to load
   * @param {args}             The command-line arguments
   * @returns {Promise<void>}  A promise that is resovled when MathJax is ready
   */
  load(name, args) {
    const file = `@mathjax/src/${args.dist ? 'bundle': 'components/js/' + name}/${name}.js`;
    return Util.import(file);
  },

  /**
   * Import a file with error reporting.
   */
  import(name) {
    return import(name).catch((err) => Util.fail(err.message));
  },

  /**
   * Report an error and exit.
   *
   * @param {string} message   The message to report
   */
  fail(message) {
    console.error(message);
    process.exit(1);
  },

  /**
   * Report an error and optionally exit, depending on the command-line options.
   *
   * @param{string|Error} err    The error message or object to report
   * @param{OptionList} err      The command-line options
   */
  error(err, args) {
    console.error(args['full-errors'] || !(err instanceof Error) ? err: err.message);
    if (args['fatal-errors'] !== false) process.exit(1);
  },

  /**
   * The options to use for a document.convert() command.
   *
   * @param {OptionList} args   The command-line options
   * @returns {OptionList}      The convert() options
   */
  convertOptions(args) {
    return {
      display: !args.inline,
      em: args.em,
      ex: args.ex,
      containerWidth: args.width || (80 * args.em),
    };
  },

  /**
   * Convert non-ASCII characters to entities.
   *
   * @param {string} text   The string to convert to entities
   * @returns {string}      The converted string
   */
  convertEntities(text) {
    return text.replace(
      /[^\n\t\r\u0020-\u007E]/gu,
      (c) => `&#x${c.codePointAt(0).toString(16).toUpperCase()};`
    );
  },

  /**
   * Adjust LiteDOM adaptor to output entities, if requested.
   *
   * @param {LiteAdaptor} adaptor  The LiteDOM adaptor to adjust
   * @param {OptionList} args      The command-line options
   */
  adjustAdaptor(adaptor, args) {
    if (args.entities) {
      //
      // Override the protectHML() and protectAttribute() methods with ones
      // that convert entities on the results of the original calls.
      //
      Object.assign(adaptor.parser, {
        _protectHTML: adaptor.parser.protectHTML,
        protectHTML(text) {return Util.convertEntities(this._protectHTML(text))},
        _protectAttribute: adaptor.parser.protectAttribute,
        protectAttribute(text, xml) {return Util.convertEntities(this._protectAttribute(text, xml))},
      });
    }
    return adaptor;
  },

  /**
   * Recursively filter nodes based on the args.
   *
   * @param {LiteAdaptor} adaptor   The adaptor to use on the nodes
   * @param {LiteElement} node      The DOM tree to process
   * @param {OptionList} args       The command-line options
   */
  filterNode(adaptor, node, args) {
    //
    // Skip text and comment nodes.
    //
    if (adaptor.kind(node).substring(0, 1) === '#') return;
    //
    // If the node is a <defs> node and we are adding styles,
    // add the minimal CSS styles.
    //
    if (args.styles && adaptor.kind(node) === 'defs') {
      adaptor.append(node, adaptor.node('style', {}, [adaptor.text(this.CSS)]));
    }
    //
    // Filter the attributes.
    //
    const attributes = adaptor.allAttributes(node);
    for (const {name} of attributes || []) {
      //
      // Save the first speech and braille attributes (should be for the full expression).
      //
      if (args.speech && !args._speech && name === 'data-semantic-speech-none') {
        args._speech = adaptor.getAttribute(node, name);
      }
      if (args.braille && !args._braille && name === 'data-semantic-braille') {
        args._braille = adaptor.getAttribute(node, name);
      }
      //
      // Remove the latex and data-semantic attributes, if requested.
      //
      if ((!args['include-latex'] && (name == 'data-latex' || name === 'data-latex-item')) ||
          (!args.semantics &&
           name.match(/^(?:data-semantic-.*|data-speech-node|data-(?:speech|braille)-attached|aria-level)$/))) {
        adaptor.removeAttribute(node, name);
      }
    }
    //
    // Process the node's children
    //
    for (const child of adaptor.childNodes(node) || []) {
      this.filterNode(adaptor, child, args);
    }
  },

  /**
   * Add speech and braille, if any, and hide children.
   *
   * @param {LiteAdaptor} adaptor   The adaptor to use on the nodes
   * @param {LiteElement} node      The DOM tree to process
   * @param {OptionList} args       The command-line options
   */
  addSpeech(adaptor, node, args) {
    //
    // Add ARIA labels, if any where found.
    //
    if (!args._speech && !args._braille) return;
    if (args._speech) {
      adaptor.setAttribute(node, 'aria-label', args._speech);
    }
    if (args._braille) {
      adaptor.setAttribute(node, 'aria-braillelabel', args._braille);
    }
    //
    // For SVG, find the math node, for CHTML use all children,
    // and set their aria-hidden attributes.
    //
    const children = adaptor.kind(node) === 'svg'
          ? [adaptor.getElement('[data-mml-node="math"]', node)]
          : adaptor.childNodes(node);
    for (const child of children) {
      if (adaptor.kind(child).charAt(0) !== '#') {
        adaptor.setAttribute(child, 'aria-hidden', 'true');
      }
    }
  },

  /**
   * Convert a (list of) expressions and return their serialized string versions.
   *
   * @param {OptionList} args         The command-line options
   * @param {object} lib              The output format's utility library object
   * @param {MathDocument} document   The MathDocument used for the conversion
   */
  async convert(args, lib, document) {
    //
    // If the lib is the Typeset library, use its output libray as the
    // util and itself to get the conversion options, otherwise use
    // lib as the util and Util as to get the conversion options.
    //
    const [util, convert] = lib.util ? [lib.util[args.output], lib] : [lib, Util];
    //
    // Check if there is a MathML vistor to use.
    //
    const visitor = util.output?.visitor;
    //
    // Get the list of expressions to convert.  If not, get them from stdin.
    //
    let list = args.math;
    if (list.length === 0) {
      if (!args.quiet) {
        console.log('Enter equations to be typeset separated by blank lines:');
      }
      list = Util.read('-').trim().split(/\n\n+/);
    }
    //
    // Make sure MathJax is ready;
    //
    if (!docoument) {
      await MathJax.startup.promise;
      document = MathJax.startup.document;
    }
    //
    // Convert the list using the document and filter the result using
    // the util.filter() method.
    //
    const math = [];
    for (const item of list) {
      try {
        const options = convert.convertOptions(args);
        const node = await document.convertPromise(String(item), options);
        math.push(util.filter(node, args, false, document, visitor));
      } catch (err) {
        Util.error(err, args)
        math.push('');
      }
    }
    //
    // Add the CSS if it was requested.
    //
    if (args.css || (args['font-cache'] === 'global' && !args.page)) {
      math.unshift(util.filter(null, args));
    }
    //
    // Return the final string.
    //
    return math.join('\n');
  },

  /**
   * Typeset a document or a list of math expressions and return the serialized result.
   *
   * @param {OptionList} args         The command-line options
   * @param {object} lib              The output format's utility library object
   * @param {MathDocument} document   The MathDocument used for the conversion
   */
  async typeset(args, lib, document) {
    //
    // Make sure MathJax is ready;
    //
    if (!document) {
      await MathJax.startup.promise;
      document = MathJax.startup.document;
    }
    //
    // If the lib is the Typeset library, use its output util, otherwise use the lib itself.
    //
    const util = lib.util?.[args.output] ?? lib;
    //
    // For file processing, call renderPromise()
    // and output the filtered page.
    //
    if (args.file) {
      await document.renderPromise();
      return util.filterPage(args, document);
    }
    //
    // For expression conversion, call the convert method.
    //
    return (await Util.convert(args, lib, document));
  },
};
