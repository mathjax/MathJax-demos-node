# [mj3-demos-node](https://github.com/mathjax/mj3-demos-node)

A repository with examples using [mathjax-v3](https://github.com/mathjax/mathjax-v3).

**NOTE**: 
Mathjax v3 is in beta release. **Do not use this in production** but please test it and report issues at [https://github.com/mathjax/mathjax-v3/issues](https://github.com/mathjax/mathjax-v3/issues)!

This is beta release 4, and the final planned beta version.  We expect an official 3.0 release in the near future.

## What's Included

This beta version includes two input processors (TeX and MathML) and two output processors (CommonHTML and SVG).  Other input and output processors (e.g., AsciiMath input) will be added in the future.

The current TeX input processor has all the core functionality of the MathJax v2 TeX input, and nearly all the extensions that are now available in v3.

The CommonHTML and SVG output implement all the MathML elements that they do in v2, but do not yet include support for line breaking (neither automatic nor explicit ones); this will be implemented in a later version.  Both output renderers currently only support the MathJax TeX font; other fonts will be added in the future.

There are a number of new features included in this beta release.  One of the most significant, however, is the ability to package portions of MathJax into components that can be used individually or in combination with others.  See the [MathJax v3 Browser Demos README](https://github.com/mathjax/mj3-demos/blob/master/README.md) for more details about components and the other new features in this release.  MathJax components can be used in a browser or in NodeJS projects, though you can also import MathJax v3 files directly into your project for maximum flexibility; there are examples of both approaches here.


## The Example files

This repository contains examples of how to use MathJax v3 in your NodeJS projects.  The examples are divided into several categories. These are divided into three main categories:  ones based on the MathJax v3 components and its loading system, ones based on the MathJax v3 components that you preload by hand (for easier synchronous use), and ones that use the base MathJax files directly without using the MathJax components.

All three groups include examples of conversion from the various input formats to the various output formats, both for individual expressions, and for complete pages containing math.  Each category includes the following executables:

* `tex2chtml`
* `tex2svg`
* `tex2mml`
* `mml2chtml`
* `mml2svg`
* `tex2chtml-page`
* `tex2svg-page`
* `mml2chtml-page`
* `mml2svg-page`

The first four convert an expression from a TeX or MathML string (its first argument) to a CommonHTML, SVG, or MathML string.  The ones ending in `-page` take an HTML file and convert the math in it from the given input format to the specified output format and output the modified page.

Use the `--help` option to get a list of all the possible options for each command.

The three categories of commands are stored in the directories called [component](component), [preload](preload), and [direct](direct).  See those directories for additional information about the example files they contain.

There are also a directory [speech](speech) that give examples of converters that add speech strings to their results, which illustrate more sophisticated operations in MathJax.  This is described in more detail in that directory.

Finally, the [custom-tex-extension](custom-tex-extension) directory contains an example of how to create your own custom TeX extension and load it as a component.  Again, see the directory for more details.

## Installation

In order to try out these examples, clone this repository, enter the directory, install the dependencies, and build the components

    git clone https://github.com/mathjax/mj3-demos-node.git mj3-demos-node
    cd mj3-demos-node
    npm install
    npm run make-components

If you are only planning to use the `direct` examples, then you don't have to build the components.

