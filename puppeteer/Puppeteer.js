import puppeteer from 'puppeteer';
import path from 'node:path';

//
// Load the needed utilities.
//
import {Typeset} from '../mjs/util/Typeset.js';
import {Util} from '../mjs/util/Util.js';
import {Tex} from '../mjs/util/Tex.js';
import {Mml} from '../mjs/util/Mml.js';
import {Am} from '../mjs/util/Am.js';
import {Chtml} from '../mjs/util/Chtml.js';
import {Svg} from '../mjs/util/Svg.js';
import {Sre} from '../mjs/util/Sre.js';

Util.altDOM = true;
Util.puppet = true;

export const Puppeteer = {
  //
  // HTML shell file (need a file:// URL so we can load other files).
  //
  html: new URL('./puppeteer.html', import.meta.url).href,

  //
  // Path to MathJax component to load
  //
  startup: new URL(import.meta.resolve('@mathjax/src/bundle/startup.js')),

  //
  // Create the MathJax configuration
  //
  config(args) {
    //
    // Start with the standard Typeset configuration.
    //
    const MathJax = Typeset.config(args);
    //
    // Set the root.
    //
    MathJax.loader.paths.mathjax = new URL('.', this.startup).href.replace(/\/$/, '');
    //
    // Remove the liteDOM and sources, if present.
    //
    MathJax.loader.load = MathJax.loader.load.filter((name) => name !== 'adaptors/liteDOM');
    delete MathJax.loader.source;
    //
    // Set the font path, if not the default.
    //
    if (args.font && args.font !== 'mathjax-newcm') {
      MathJax.loader.paths[args.font] =
        new URL('.', import.meta.resolve(`@mathjax/${args.font}-font/package.json`)).href;
    }
    //
    // Remove the document (it will be loaded in typeset below)
    //
    delete MathJax.startup.document;
    if (args.file) {
      const wd = new URL(process.cwd() + '/', import.meta.url).href;
      args.file = new URL(args.file, wd).href;
    }
    //
    // Remove unneeded functions.
    //
    delete MathJax.loader.require;
    delete MathJax.startup.ready;
    //
    // Return the adjusted configuration.
    //
    return MathJax;
  },

  //
  // Remove any functions from the configuration and define them later
  //
  removeFunctions(MathJax, args) {
    const declarations = [];
    //
    // Move the loader.failed function.
    //
    declarations.push(`MathJax.loader.failed = ${MathJax.loader.failed.toString()};`);
    delete MathJax.loader.failed;
    //
    // Move the tex.formatError function.
    //
    if (MathJax.tex) {
      declarations.push(`MathJax.tex.formatError = ${MathJax.tex.formatError.toString()};`);
      delete MathJax.tex.formatError;
    }
    //
    // Move the MathML renderAction functions.
    //
    if (args.output === 'mml' && args.file) {
      const action = MathJax.options.renderActions.typeset;
      declarations.push(`MathJax.options.renderActions.typeset[1] = ${action[1].toString()};`);
      declarations.push(`MathJax.options.renderActions.typeset[2] = ${action[2].toString()};`);
      action[1] = action[2] = null;
    }
    return declarations;
  },

  //
  // Create the MathJax configuration script.
  //
  configScript(args) {
    const MathJax = this.config(args);
    const declarations = this.removeFunctions(MathJax, args);
    return 'MathJax = ' + JSON.stringify(MathJax) + '\n' + declarations.join('\n');

  },

  //
  // The function that runs in the puppet.
  //
  async convert(options, args) {
    window.args = args;                // Make the arguments global (needed in some ready scripts)
    await MathJax.startup.promise;     // Wait for MathJax to set up
    Util.startup(args);                // Run the startup scripts
    if (args.file) {
      Util.removeScripts();            // Arrange to remove any scripts MathJax added
    }
    //
    // Do the actual typesetting and conversion
    //
    return Util.typeset(args, Util[args.output], MathJax.startup.document, options);
  },

  //
  // Reporter for console messages from the puppet.
  //
  async report(msg) {
    const msgs = await Promise.all(
      msg.args().map(
        (arg) => arg.evaluate((arg) => (arg instanceof Error) ? arg.stack : arg.message || arg)
      )
    );
    if (msgs.join(',') === '_die_') process.exit(1);
    if (msgs.length) {
      console[msg.type()](`[${msg.type().toUpperCase()}]`, ...msgs);
      if (msg.type() === 'error' && this['fatal-errors']) process.exit(1);
    }
  },

  //
  // Report an error from the typeset script.
  //
  error(e, prefix = 'Script error:') {
    if (e.stack) {
      console.error(prefix, e.stack);
    } else {
      console.log(e);
    }
  },

  //
  // Perform the typesetting in the puppet.
  //
  async typeset(args, config, options, component, convert) {
    config ??= Puppeteer.configScript(args);
    options ??= Typeset.convertOptions(args);
    component ??= this.startup.pathname;
    convert ??= Puppeteer.convert;

    const browser = await puppeteer.launch();         // launch the browser
    const page = await browser.newPage();             // and get a new page
    page.on('console', Puppeteer.report.bind(args));  // report messages from chrome
    await page.goto(args.file || this.html);          // open the HTML page
    await page.addScriptTag({path: 'util.js'});       // load the util script
    await page.addScriptTag({content: config});       // configure MathJax
    await page.addScriptTag({path: component});       // load the MathJax conponent
    return page.evaluate(convert, options, args)      // perform the conversion
      .then((output) => [output, null])               // and return its output
      .catch((err) => [null, err])                    // pasing on any errors
      .then(async ([result, err]) => {                // error or not:
        const output = result;                        //   make local copy
        await browser.close();                        //   close the browser
        if (err) throw err;                           //   throw any error again
        return output;                                //   return the output
      });
  },
};
