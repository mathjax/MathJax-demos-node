# MathJax Using LINKEDOM

This example shows how to run MathJax within a
[LINKEDOM](https://github.com/WebReflection/linkedom#readme) instance.
Although MathJax provides a lightweight DOM implementation (called
LiteDOM) for use in node applications, it is limited in its scope, and
you may want to work within a more full-featured DOM.  For example, if
you plan to manipulate the DOM as though you were using a browser, it
may be more convenient to to use LINKEDOM than LiteDOM.  Note,
however, that because LINKEDOM implements a lot more of the DOM
functionality, it is slower and larger.

## The Examples

There are four example files here, `typeset-simple`,
`typeset-component`, `typeset-direct` and `typeset-mixed` that each
implement an general typesetting tool in one of the four main ways of
using MathJax in node applications.  These correspond to the versions
of `typeset` in the [`mjs`](../mjs) subdirectories, and each can be
used to typeset one or more expressions or a file using any of the
three input formats that MathJax supports (TeX/LaTeX, MathML, or
AsciiMath), and any of its output formats (CHTML, SVG, or MathML).

These work essentially the same as the corresponding mjs examples, but
they load the `adaptors/linkedom` adaptor rather than the
`adaptors/liteDOM` adaptor.  The linkedom adaptor requires that you load
the LINKEDOM node module and pass that to the adaptor when it is created.
These details are encapsulated in the [`Linkedom.js`](Linkedom.js) utility
file.  The rest of the work is done by the utility files in
[`mjs/util`](../mjs/util).

## Installation

In order to try out these examples you must install its dependencies.
Since the code relies on LINKEDOM, that needs to be installed, so this
directory contains a separate `package.json` file, and you should do
the following:

``` bash
cd MathJax-demos-node/linkedom
npm install
```

To run the examples, use

```
node <example-name> -i <format> -o <format> [options] [expressions...]
```

where `<example-name>` is the name of the example file, `<format>` is
one of the input or output formats, and `expressions` are zero or more
expressions.  If no expressions are given, then they are taken from
standard input.  Use

```
node <example-name> --help
```

for details about other options.

The `adaptors/linkedom` adaptor is now standard in v4, so you don't need
to built is by hand, as you did in v3.
