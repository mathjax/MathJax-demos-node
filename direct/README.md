# Non-Component-Based Examples

The examples in this directory illustrate how to use MathJax by directly importing the MathJax files directly into your project rather than using the MathJax predefined components.  While using components is easier, in general, the direct approach gives you the most control over what is included, and when it is loaded.

All the examples in this directory consist of four main parts:

1. Processing the command-line arguments (not described here),
2. Importing the necessary MathJax files,
3. Creating the needed MathJax objects, and
4. Performing the desired conversion using those objects.

These parts are described below using the `tex2chtml` command as an example.  It loads the following MathJax values:

```js
const {mathjax} = require('mathjax-full/js/mathjax.js');
const {TeX} = require('mathjax-full/js/input/tex.js');
const {CHTML} = require('mathjax-full/js/output/chtml.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AssistiveMmlHandler} = require('mathjax-full/js/a11y/assistive-mml.js');

const {AllPackages} = require('mathjax-full/js/input/tex/AllPackages.js');
```

The `TeX` and `CHTML` objects are the input and output jax class constructors, the `liteAdaptor` is the constructor for the liteDOM adaptor, `RegisterHTMLHandler` is a function used to tell MathJax that we want to work with HTML documents (using a particular DOM adaptor), and `AssistiveMmlHandler` is a function to add the assistive-MathML functionality to the registered handler.  Finally, `AllPackages` is an array of the package names to use to initialize the TeX input jax; it includes all the available TeX packages except `autoload` and `require` (which rely on the component system to operate), and `physics` and `colorv2`, which have been loaded, but aren't included in the package array by default since `physics` redefines many standard macros and `color` is used rather than `colorv2` for the `\color` macro.  You can add `'physics'` to the array if you want to include it yourself.

Next we create the needed MathJax objects:

```js
const adaptor = liteAdaptor();
const handler = RegisterHTMLHandler(adaptor);
if (argv.assistiveMml) AssistiveMmlHandler(handler);

const tex = new TeX({packages: argv.packages.split(/\s*,\s*/)});
const chtml = new CHTML({fontURL: argv.fontURL});
const html = mathjax.document('', {InputJax: tex, OutputJax: chtml});
```

Here we create the `liteDOM` adaptor and use it to tell MathJax that we will use HTML documents with the `liteDOM` implementation of the DOM.  We extend the handler to include the assistive-MathML support, if requested on the command line.  Then we create the input and output jax, and create an empty document (based on the `liteDOM`) with those input and output jax.

Finally, we do the conversion:

```js
const node = html.convert(argv._[0] || '', {
    display: !argv.inline,
    em: argv.em,
    ex: argv.ex,
    containerWidth: argv.width
});

if (argv.css) {
    console.log(adaptor.textContent(chtml.styleSheet(html)));
} else {
    console.log(adaptor.outerHTML(node));
}
```

This uses the `convert()` method of the math document created above, which takes the command-line argument (the TeX math string) and the data about font metrics and returns an HTML node (as represented by the `liteDOM`).  We use the adaptor to extract either the serialized version of the node, or the CSS styles required by the expression and print them to the terminal.
