# [MathJax-demos-node](https://github.com/mathjax/MathJax-demos-node)

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
* `mml2chtml-page`
* `mml2svg-page`
* `am2chtml-page`

The first four convert an expression from either a TeX or MathML string (its first argument) to a CommonHTML, SVG, or MathML string.  The ones ending in `-page` take an HTML file and convert the math in it from the given input format to the specified output format and output the modified page.

Use the `--help` option to get a list of all the possible options for each command.

The three categories of commands are stored in the directories called [component](component), [preload](preload), and [direct](direct).  See those directories for additional information about the example files they contain.

There is also a directory [speech](speech) that give examples of converters that add speech strings to their results, which illustrate more sophisticated operations in MathJax.  This is described in more detail in that directory.

Finally, the [custom-tex-extension](custom-tex-extension) directory contains an example of how to create your own custom TeX extension and load it as a component.  Again, see the directory for more details.

## Installation

In order to try out these examples, clone this repository, enter the directory, and install the dependencies:

    git clone https://github.com/mathjax/MathJax-demos-node.git MathJax-demos-node
    cd MathJax-demos-node
    npm install

The examples should be executable files that you can run.  On non-unix systems, you may need to call

    node -r esm <example-name>

where `<example-name>` is the name of the example.  Some examples take an argument (like a TeX string) that follows the `<example-name>` above.
