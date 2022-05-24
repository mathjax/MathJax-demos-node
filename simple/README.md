# Simple-Component Examples

The examples in this directory illustrate how to use MathJax components in your node projects in a simple way using promises to mediate the flow of your program.

All the examples in this directory consist of three main parts:

1. Processing the command-line arguments (not described here),
2. Loading the MathJax package and configuring it, and
3. Converting the math and outputting the result.

The MathJax components come in two forms:  their original source code, and webpacked files that combine all the dependencies into one file.  Your node projects can use either form, and if you are debugging components, it is often convenient to use the source files so you don't have to do the webpack step each time you make a change.  The example files let you choose which format you want to use via the `--dist` or `--no-dist` options (`--no-dist` is the default, so the source files are used).  This is controlled by setting the `source` array in the code sample below, and by choosing which version of the MathJax component file to use.

Loading MathJax is easy, as you just use

```js
require('mathjax-full')
```

(or you can use the smaller `mathjax` npm package if you are not going to use the source files).  This provides you with an object that has a single `init()` function that you call to initialize MathJax.  This returns a promise that is resolved when MathJax is set up and ready to be used.  You can use `then()` and `catch()` to schedule the actions you want MathJax to perform and trap errors that may occur.

**Note**: When you require MathJax in this way, it is set up for use within node applications, not for browser use.  See the [MathJax web examples](https://github.com/mathjax/MathJax-demos-web) repository for examples of MathJax in browsers, and how to make custom builds of MathJax.  Other than that, the configuration and usage of MathJax in node should be essentially the same as for in-browser use.

An example of the code used for the `tex2chtml` example is given below.  The `argv` object contains the command-line arguments and option values:

```js
require('mathjax-full').init({
    //
    //  The MathJax configuration
    //
    options: {
        enableAssistiveMml: argv.assistiveMml
    },
    loader: {
        source: (argv.dist ? {} : require('mathjax-full/components/src/source.js').source),
        load: ['adaptors/liteDOM', 'tex-chtml']
    },
    tex: {
        packages: argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)
    },
    chtml: {
        fontURL: argv.fontURL
    },
    startup: {
        typeset: false
    }
}).then((MathJax) => {
    //
    //  Typeset and display the math
    //
    MathJax.tex2chtmlPromise(argv._[0] || '', {
        display: !argv.inline,
        em: argv.em,
        ex: argv.ex,
        containerWidth: argv.width
    }).then((node) => {
        const adaptor = MathJax.startup.adaptor;
        //
        //  If the --css option was specified, output the CSS,
        //  Otherwise, output the typeset math as HTML
        //
        if (argv.css) {
            console.log(adaptor.textContent(MathJax.chtmlStylesheet()));
        } else {
            console.log(adaptor.outerHTML(node));
        };
    });
}).catch(err => console.log(err));
```

The first configuration block gives the options for the MathJax document.  In this case, it determines whether assistive MathML will be added to the typeset math or not.  The next block is for the
`loader` module.  It sets the `source` for loading the components (when you are loading source rather than distribution versions), and requests the loading of the `adaptors/liteDOM` and `tex-chtml` components.

Then the `tex` and `chtml` components are configured, and finally,  the `startup` component is configured to turn off the initial typesetting run, since there is no document to process (this is not strictly required, but prevents unneeded work).

Once MathJax is loaded and initialized, the promise returned by `init()` is resolved, and the `then()` action is performed.  In this case, it uses the `tex2chtmlPromise()` command to convert the `tex2chtml` command's first argument from TeX to HTML.  We use the promise-based form so that we can process autoloaded extensions and the `\require` macro.  When the typesetting is finished, we look up the DOM adaptor from the startup module, and either print the CSS needed for the expression, or the serialized HTML for the expression, using the adaptor to obtain the needed data from the internal representation of the HTML elements.

Any errors are trapped by the final `catch()` method, and printed to the terminal.
