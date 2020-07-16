# [MathJax-demos-node](https://github.com/mathjax/MathJax-demos-node)
<img class="shield" alt="GitHub release version" src="https://img.shields.io/github/v/release/mathjax/MathJax-src.svg?sort=semver">

A repository with examples using [MathJax version 3](https://github.com/mathjax/MathJax-src) in node applications.

See the [MathJax Web Demos](https://github.com/mathjax/MathJax-demos-web) for examples of how to use MathJax in web pages.  See the [MathJax documentation](https://docs.mathjax.org/) for complete details of how to use MathJax in web browsers and node.

## The Example files

This repository contains examples of how to use MathJax v3 in your node projects.  These are divided into three main categories:  ones based on the MathJax v3 components and its loading system, ones based on the MathJax v3 components that you preload by hand (for easier synchronous use), and ones that use the base MathJax files directly without using the MathJax components.

All three groups include examples of conversion from the various input formats to the various output formats, both for individual expressions, and for complete pages containing math.  Each category includes the following executables:

* `tex2chtml`
* `tex2svg`
* `tex2mml`
* `mml2chtml`
* `mml2svg`
* `am2chtml`
* `am2mml`
* `tex2chtml-page`
* `tex2svg-page`
* `tex2mml-page`
* `mml2chtml-page`
* `mml2svg-page`
* `am2chtml-page`

The first seven convert an expression from either a TeX, MathML, or AsciiMath string (given as its first argument) to a CommonHTML, SVG, or MathML string.  The ones ending in `-page` take an HTML file and convert the math in it from the given input format to the specified output format and output the modified page.

Use the `--help` option to get a list of all the possible options for each command.

The three categories of commands are stored in the directories called [`component`](component), [`simple`](simple), [`preload`](preload), and [`direct`](direct).  Both the `component` and `simple` directories are examples of the component-based approach, with the `component` directory containing versions that mirror the approach needed when MathJax is used in web pages, and the `simple` directory containing examples that take advantage of some simplifications available in node.  Each of those directories contain additional information about the example files they contain.

There is also a directory [`speech`](speech) that give examples of converters that add speech strings to their results, which illustrate more sophisticated operations in MathJax.  This is described in more detail in that directory.

The [`custom-tex-extension`](custom-tex-extension) directory contains an example of how to create your own custom TeX extension and load it as a component.  Again, see the directory for more details.

The [`puppeteer`](puppeteer) directory contains an example of how to use the [Puppeteer](https://developers.google.com/web/tools/puppeteer) library to use a headless Chrome instance to do server-side conversion of mathematics using MathJax.  This is useful in situations where you are using characters that are not included in the main MathJax fonts, as Chrome will be able to measure the widths of these characters so that they can be displayed more reliably.

## Installation

In order to try out these examples, clone this repository, enter the directory, and install the dependencies:

``` bash
git clone https://github.com/mathjax/MathJax-demos-node.git MathJax-demos-node
cd MathJax-demos-node
npm install
```

The examples should be executable files that you can run.  On non-unix systems, you may need to call

``` bash
node -r esm <example-name>
```

where `<example-name>` is the name of the example file.  Some examples take an argument (like a TeX string) that follows the `<example-name>` above.
