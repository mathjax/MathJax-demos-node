# [mj3-demos-node](https://github.com/mathjax/mj3-demos-node)

A repository with examples using [mathjax-v3](https://github.com/mathjax/mathjax-v3) in NodeJS.

## NOTE

Mathjax v3 is in beta release. **Do not use this in production** but please test it and report issues at [https://github.com/mathjax/mathjax-v3/issues](https://github.com/mathjax/mathjax-v3/issues)!

See the [mathjax3 beta branch](https://github.com/mathjax/mathjax-v3/tree/beta) for details concerning the current beta release.

## The Example files

This repository contains the following samples files:

* `mj3-tex2mml` for converting TeX expressions to serialzied MathML.
* `mj3-tex2html` for converting TeX expressions to serialized HTML (and obtaining the necessary CSS styles).
* `mj3-tex2svg` for converting TeX expressions to serialized SVG images (and obtaining the necessary CSS styles).
* `mj3-mml2html` for converting MathML expressions to serialzied HTML (and obtaining the necessary CSS styles).
* `mj3-mml2svg` for converting MathML expressions to serialzied SVG images (and obtaining the necessary CSS styles).
* `mj3-tex2html-page` for converting a full HTML page with TeX notation to its final form with CommonHTML output.
* `mj3-tex2svg-page` for converting a full HTML page with TeX notation to its final form with SVG output.

These can be run from the command line.  Use the `--help` option to get the format and list of available options for each command.

These files act as examples of how to call MathJax version 3 from within your NodeJS programs.

More documentation will be forthcoming as we progress with the development of MathJax v3.
