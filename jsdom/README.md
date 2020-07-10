# MathJax in JSDOM

This example shows how to run MathJax within a [JSDOM](https://github.com/jsdom/jsdom) instance.  Although MathJax provides a lightweight DOM implementation (called LiteDOM) for use in node applications, it is limited in its scope, and you may want to work within a more full-featured DOM.  For example, if you plan to manipulate the DOM as though you were using a browser, it may be more convenient to to use JSDOM than LiteDOM.  Note, however, that because JSDOM implements a lot more of the DOM functionality, it is slower and larger.

## The Examples (Simple Approach)

The `tex2chtml` and `tex2chtml-page` examples in this directory are nearly identical to the ones in the [`simple`](../simple) directory, with the exception that they use the `jsdomAdaptor` rather than the `liteAdaptor`.  The key changes are to replace the `loader` block of the configuration to

``` javascript
  loader: {
    paths: {jsdom: `${__dirname}/adaptor`},
    source: (argv.dist ? {} : require('mathjax-full/components/src/source.js').source),
    load: ['[jsdom]/adaptor' + (argv.dist ? '.min.js' : ''), 'tex-chtml']
  },
```

which sets up a `[jsdom]` path prefix, and loads the `jsdomAdaptor` from that location, and the addition of

``` javascript
  JSDOM: require('jsdom').JSDOM,
```

to the configuration, since the `jsdomAdaptor` needs access to that.


## The Examples (Direct Approach)

The `tex2svg` and `tex2svg-page` examples in this directory are nearly identical to the ones in the [`direct`](../direct) directory, with the exception that they use the `jsdomAdaptor` rather than the `liteAdaptor`.  The key changes are using

``` javascript
const {jsdomAdaptor} = require('mathjax-full/js/adaptors/jsdomAdaptor.js');
```

instead of the corresponding `liteAdaptor` require, the addition of

``` javascript
const {JSDOM} = require('jsdom');
```

in order to load the JSDOM library, and

``` javascript
const adaptor = jsdomAdaptor(JSDOM);
```

rather than the corresponding `liteAdaptor()` call.  The rest of the code is identical to the direct approach with the lite adaptor.

Note that there is no JSDOM component, so you can't use the component-based approaches to MathJax with JSDOM. It would be possible to construct a custom component for the JSDOM adaptor, if you needed to use the components approach.  



## Installation

In order to try out this example you must install its dependencies.  Since the code relies on JSDOM, that needs to be installed, so this directory contains a separate `package.json` file, and you should do the following:

``` bash
cd MathJax-demos-node/jsdom
npm install --production
```

(If you wish to rebuild the jsdom adaptor component, then leave off the `--production` so that the developer dependencies will be isntalled.)

The exampk files should be executables that you can run.  On non-unix systems, you may need to call

``` bash
node -r esm <example-name>
```

where `<example-name>` is the name of the example file.  Some examples take an argument (like a TeX string) that follows the `<example-name>` above.

To rebuild the JSDOM adaptor component (in the [`adaptor`](adaptor) directory), do the following:

``` bash
cd MathJax-demos-node/jsdom/adaptor
../node_modules/mathjax-full/components/bin/pack
```
