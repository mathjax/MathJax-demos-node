# Custom TeX Extension

This example shows how to create a custom TeX extension that defines new TeX commands implemented by javascript functions.

The commands implemented by this example provides the ability to generate MathML token elements from within TeX by hand.  This allows more control over the content and attributes of the elements produced.  The macros are `\mi`, `\mo`, `\mn`, `\ms`, and `\mtext`, and they each take an argument that is the text to be used as the content of the corresponding MathML element.  The text is not further processed by TeX, but the extension does convert sequences of the form `\uNNNN` (where the N's are hexadecimal digits) into the corresponding unicode character; e.g., `\mi{\u2460}` would produce U+2460, a circled digit 1.

The main code for the extension is

* [mml.js](mml.js)

which contains comments describing it in detail.  This file can be loaded into your node project either directly, or as an external component.  We describe the latter approach here.

The key portions of the [code](tex2mml) used to do this is described below.

First, we add the `mml` package to the default list of packages:

```js
const PACKAGES = 'base, autoload, require, ams, newcommand, mml';
```

Then we configure MathJax to know about the new package:

```js
MathJax = {
    loader: {
        paths: {
            mathjax: 'mathjax-full/es5',
            custom: '.'
        },
        source: (argv.dist ? {} : require('mathjax-full/components/src/source.js').source),
        require: require,
        load: ['input/tex', 'adaptors/liteDOM', '[custom]/mml']
    },
    tex: {packages: argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)},
    startup: {
        pageReady: () => {
            MathJax.tex2mmlPromise(argv._[0] || '', {display: !argv.inline})
                .then(mml => console.log(mml))
                .catch(err => console.log(err));
        }
    }
};
```

The `loader` block adds a new path named `custom` that is tied to the current directory.  This is used to load the custom extension (you could have several extensions in the same directory).  It also sets `require` for use with node, and asks MathJax to load the `tex` input component, the `liteDOM` adaptor, and the new custom `mml` extension.  (Note that we don't load an output jax in this example, since we are only converting to MathML, which is the internal format of MathJax.)

The `tex` configuration includes the `mml` package in the `package` array by default.

Finally, the `startup` block configures the `pageReady()` function to do the default startup initialization, and then does a conversion from TeX to MathML, either printing the result, or an error message.  This gives you the chance to see the result of the `\mi`, `\mo`, etc. on the resulting MathML representation.
