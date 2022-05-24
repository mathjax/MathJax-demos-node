# Preloaded Component Examples

The examples in this directory illustrate how to use MathJax components in your node projects by preloading the ones you need, and letting MathJax know which you have loaded.  That avoids the asynchronous startup process that MathJax usually uses to load the components (at the cost of your having to know which ones to load yourself, including any dependencies).  To operate completely synchronously, you would want to disable the `autoload` and `require` extensions by not including them in the `packages` array for the TeX input jax, or load the `all-packages` component so that there is no need to dynamically load extensions later.  Alternatively, you could use the promise-based typesetting and conversion functions and still be able to handle autoloading even though you have preloaded some components by hand.

All the examples in this directory consist of four main parts:

1. Processing the command-line arguments (not described here),
2. Configuring MathJax and loading the needed components,
3. Running the startup module, and
4. Performing the desired conversion.

These parts are described below using the `tex2chtml` command as an example.  The configuration and loading of components is accomplished via

```js
MathJax = {
    options: {enableAssistiveMml: argv.assistiveMml},
    tex: {packages: argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)},
    chtml: {fontURL: argv.fontURL},
    startup: {typeset: false}
};

//
//  Load all the needed components
//
require('mathjax-full/components/src/startup/lib/startup.js');
require('mathjax-full/components/src/core/core.js');
require('mathjax-full/components/src/adaptors/liteDOM/liteDOM.js');
require('mathjax-full/components/src/input/tex-base/tex-base.js');
require('mathjax-full/components/src/input/tex/extensions/all-packages/all-packages.js');
require('mathjax-full/components/src/output/chtml/chtml.js');
require('mathjax-full/components/src/output/chtml/fonts/tex/tex.js');
require('mathjax-full/components/src/a11y/assistive-mml/assistive-mml.js');
require('mathjax-full/components/src/startup/startup.js');

//
//  Let MathJax know these are loaded
//
MathJax.loader.preLoad(
    'core',
    'adaptors/liteDOM',
    'input/tex-base',
    '[tex]/all-packages',
    'output/chtml',
    'output/chtml/fonts/tex',
    'a11y/assistive-mml'
);
```

The `MathJax` object simply configures the document, `tex`, `chtml`, and startup modules, and then the various components that we want to use are loaded.  The first `require()` statement is important in that it initializes the startup module so that the other modules can properly hook into it.  The `core` module should be loaded next, as it is needed by all the other modules.  The `adaptors/liteDOM` is needed since we don't have a browser DOM to work with.  We load `tex-base` rather than `tex`, since `all-packages` includes the other packages and there is no need to load duplicate code.  We load the `chtml` output component, and the `chtml/fonts/tex` component so that we have the font data as well.  The `a11y/assistive-mml` component is loaded to provide hidden MathML for accessibility.  Finally, we load the `startup` component (the first load was just its library).

Once the files are loaded and MathJax is told about them, we tell the startup module to initialize itself:

```js
MathJax.config.startup.ready();
const adaptor = MathJax.startup.adaptor;
```

This creates the needed input and output jax, the DOM adaptor, and the internal MathDocument.  These are stored in the `MathJax.startup` object where we can retrieve them, if needed, as we do with the `adaptor`, here.

Finally, we do the conversion:

```js
const node = MathJax.tex2chtml(argv._[0] || '', {
    display: !argv.inline,
    em: argv.em,
    ex: argv.ex,
    containerWidth: argv.width
});

if (argv.css) {
    console.log(adaptor.textContent(MathJax.chtmlStylesheet()));
} else {
    console.log(adaptor.outerHTML(node));
};
```

This uses the `MathJax.tex2chtml()` function created for us by the startup module, which takes the command-line argument (the TeX math string) and the data about font metrics and returns an HTML node (as represented by the `liteDOM`).  We use the adaptor to extract either the serialized version of the node, or the CSS styles required by the expression and print them to the terminal.
