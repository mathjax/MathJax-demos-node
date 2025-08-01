# [MathJax-demos-node](https://github.com/mathjax/MathJax-demos-node)
<img class="shield" alt="GitHub release version" src="https://img.shields.io/github/v/release/mathjax/MathJax-demos-node.svg?sort=semver">

A repository with examples using [MathJax version 4](https://github.com/mathjax/MathJax-src) in node applications.

See the [MathJax Web Demos](https://github.com/mathjax/MathJax-demos-web) for examples of how to use MathJax in web pages.  See the [MathJax documentation](https://docs.mathjax.org/) for complete details of how to use MathJax in web browsers and node.  In particular, the [Examples in Node](https://docs.mathjax.org/en/latest/server/examples.html) page contains a list of the most important examples for node applications; the [Examples in a Browser](https://docs.mathjax.org/en/latest/web/examples.html) page lists other examples that may be useful; though they target web pages, the same techniques can be employed in node.

## The Example files

This repository contains a number of examples of command-line tools that exhibit the features of MathJax.  The tools provide a number of command-line options, which you can discover by using the `--help` option when running them.  Most of the examples include the ability to generate speech strings for the output, for example, via the `--speech` or ``--braille` options, and the language can be specified using `--sre locale de`, for example to get a German localization.

The tools accept one or more mathematical expressions as their arguments, or you can use the `--file` option to specify an HTML file that will be processed in full.  If you don't give a file name, then the file is taken from standard input.  Similarly, if you don't give any expressions, then they are taken from standard in, with a blank line separating expressions.

The tools come in two forms, one using ESM modules in the [`mjs`](mjs) directory, and one using CommonJS modules in the [`cjs`](cjs) folder, so you can see examples of both types.  These directories are further subdivided into groups based on the mechanism by which MathJax is used:  [`simple`](mjs/simple) uses a node-only mechanism that makes it easy to start experimenting with MathJax, but can't be used in web applications; [`component`](mjs/component) uses the MathJax Component framework to access MathJax's components via a configuration object like the one used in web browsers; [`direct`](mjs/direct) uses direct calls to the MathJax modules, without using MathJax components (so dynamic loading of TeX extensions is not supported for example); and finally, [`mixed`](mjs/mixed) combines direct calls with MathJax Components for the best of both worlds.

All four groups include examples of conversion from the various input formats to the various output formats, and include the following executables:

* `tex2chtml`
* `tex2svg`
* `tex2mml`
* `mml2chtml`
* `mml2mml`
* `mml2svg`
* `am2chtml`
* `am2mml`
* `am2svg`
* `typeset`

The first nine convert from the format listed before the `2` to the format listed after it, and represent all combinations of the three input formats with three output formats.  The `mml2mml` example is useful for reformatting a MathML string, or for converting it to use the Mathematical Alphanumerics block of Unicode characters rather than `mathvariant` attributes with ASCII characters, as required by MathML-Core, for instance.

The `typeset` tool allows you to convert from any input format to any output format, so is a "swiss army knife" example that gives you access to all the options within a common command.

Use the `--help` option to get a list of all the possible options for each tool.

The [`custom-tex-extension`](custom-tex-extension) directory contains an example of how to create your own custom TeX extension and load it as a component.  See that directory for more details.

The [`puppeteer`](puppeteer) directory contains an example of how to call the [Puppeteer](https://developers.google.com/web/tools/puppeteer) library to use a headless Chrome instance to do server-side conversion of mathematics using MathJax.  This is useful in situations where you are using characters that are not included in the main MathJax fonts, or including HTML within TeX or MathML expressions, as Chrome will be able to measure the sizes of these so that they can be displayed more reliably.

Finally, the [`jsdom`](jsdom) and [`linkedom`](linkedom) directories include examples of how to use those DOM libraries instead of MathJax's usual `LiteDOM` library as a replacement for the browser DOM.

## The Utility Libraries

The tools in the `mjs` and `cjs` directories share a lot of common code, and that shared code has been moved to separate utility files in the [`util`](mjs/util) sub-directories of those directories.  There is one for each of the input and output formats (the `Mml.js` file contains the code for both input and output in MathML format), and a main `Util.js` file that holds code common to all the tools.  The `Direct.js` and `Mixed.js` utilities have code specific to those mechanisms of accessing MathJax, and the `Typeset.js` file handles the special needs of the `typeset` tool.

These utilities form the heart of the command-line tools, and it is in them that you will see the real details of how to work with MathJax; the individual tool files basically just load the needed libraries or MathJax modules, set up the configuration needed, and call the utility libraries to handle the details or getting the command-line arguments, setting up the needed configuration options, converting the expression or files, filtering the results according to the options given, and printing the results.

## Installation

In order to try out these examples, clone this repository, enter the directory, and install the dependencies:

``` bash
git clone https://github.com/mathjax/MathJax-demos-node.git MathJax-demos-node
cd MathJax-demos-node
npm install
```

To run the tools, use

``` bash
node <example-name> [options] [expressions...]
```

where `<example-name>` is the name of the example file, like `tex2svg`.  Use the `--help` options to get more details about the options and arguments that each tool needs.
