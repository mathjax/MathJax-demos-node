# MathJax in Puppeteer

This example shows how to run MathJax within a headless Chrome
instance using the
[Puppeteer](https://developers.google.com/web/tools/puppeteer)
library.  Although MathJax provides a lightweight DOM implementation
(called `LiteDOM`) for use in node applications, it is limited in its
scope, and there are reasons you may want to work within an actual
browser DOM.  For example, when a character is used that is not in
MathJax's fonts, MathJax can query the browser to attempt to determine
the character's size, but this only works in an actual browser, not
MathJax's `LiteDOM`.  Similarly, if you have specified
`mtextInheritFont: true` or have set the `mtextFont`, MathJax asks the
browser to compute the size of the resulting text strings.  So if you
are processing expressions that contain characters not in MathJax's
fonts, or are using inherited or explicit fonts for text-mode
material, MathJax's `LiteDOM` will produce poorer quality results than
in an actual browser.  Using an actual browser DOM, made available by
Puppeteer, is one solution to this problem.

## The Example Code

The [`typeset`](typeset) file is a general-purpose typesetting tool
that can be used to typeset one or more expressions or a file using
any of the three input formats that MathJax supports (TeX/LaTeX,
MathML, or AsciiMath), and any of its output formats (CHTML, SVG, or
MathML).  It calls on the utility files in [`mjs/util`](../mjs/util)
to do most of the work, just as the other examples do.  There is also
a [`Puppeteer.js`](Puppeteer.js) utility that implements the
puppeteer-specific code needed for the tool.  There are two files that
are used within the headless Chrome that is being run by the Puppeteer
library: [`puppeteer.html`](puppeteer.html), which is a shell HTML
file that is used to process individual expressions in the Chrome
instance, and [`util.js`](util.js), which contains the portions of the
utility files from `mjs/util` that are needed in Chrome.  (Ideally,
`typeset` would pass the needed commands from those utilities rather
than duplicating them here, and that may be added in the future, but
for now, this is sufficient to get the job done.)

The key piece of code in `Puppeteer.js` that does the communication
with the headless Chrome is the `typeset()` function:

```
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
  }
```

This function takes the one required argument and four optional ones:
the list of command-line options (required), a MathJax configuration
(as a string), options to pass to the conversion function, the URL for
the MathJax component to load, and a conversion function to perform.
The configuration script defaults to the one produced by
`Puppeteer.configScript(args)`, the options default to
`Typeset.convertOptions(args)`, the component defaults to MathJax's
`startup` component, and the convert function to `Puppeteer.convert`
(described below).

The next steps launch the headless Chrome instance and set up a page
within the browser.  We attach an event handler to process any console
messages from Chrome (e.g., error messages from MathJax).  Next we
open either the file specified by the `--file` command-line option, or
the default `puppeteer.html` file in this directory, and then load the
[`util.js`](util.js) script into the page.  After that, we process the
configuration script, and load the specified MathJax component.

The `page.evaluate()` command does the real work by calling the
`convert()` function, passing it the options and command-line
arguments, and returning the output from the convert command.  The
first `then()` call puts the output into an array, while the `catch()`
call traps any errors, returning them in the second part of the array.
The final `then()` closes the browser and throws the error again, if
there is one, otherwise it returns a copy of the output (because the
`result` was tied to the browser, which is now closed, if we didn't
copy it first, we would produce an error when trying to return the
output).

As an `async` function, `typeset()` returns a promise that resolves
when the output is produced by Chrome.  The `typeset` node application
calls `Puppeteer.typeset()` and waits for the promise to resolve, then
prints the result, catching any errors and printing those.

The conversion function that runs in the Chrome instance is
`Puppeteer.convert()`.  It is passed the conversion options and the
command-line arguments:

```
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
```

It makes the `args` object a global (since some ready functions need
that), and then waits for MathJax to start up.  Then it calls the
`startup()` function from the [`util.js`](util.js) file, which runs
any function that would normally have been added to the
`MathJax.startup.ready()` function.  Then, if we are processing a
file, we arrange for the MathJax scripts to be removed after the page
is typeset (the `removeScripts()` function patches the MathDocument's
`renderPromise()` method to record the scripts that were in place
originally, then do the usual `renderPromise()` then remove any
scripts that were not there originally).  Finally, it call the
`Util.typeset()` function to do the actual processing of the
expressions or the page.

## Installation

In order to try out this example you must install its dependencies.
Since the code relies on Puppeteer, that needs to be installed, so
this directory contains a separate `package.json` file, and you should
do the following:

``` bash
cd MathJax-demos-node/puppeteer
npm install
```

To run the example, use

```
node typeset -i <format> -o <format> [options] [expressions...]
```

where `<format>` is one of the input or output formats, and
`expressions` are zero or more expressions.  If no expressions are
given, then they are taken from standard input.  Use

```
node typeset --help
```

for details about other options.
