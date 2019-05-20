# Component-Based Examples

The examples in this directory illustrate how to use MathJax v3 components in your NodeJS projects.  Loading of components in asynchronous, and so you may need to use promises to mediate the flow of your program, particular program startup.  Once MathJax's components are loaded, however, you can call the non-promise-based functions, but should use the promise-based ones if you want to support autoloading of extensions or the `\require` macro in TeX input.  (Note that the [preload](../preload/README.md) examples show how to operate synchronously from the outset, if that is required.)

All the examples in this directory consist of three main parts:

1. Processing the command-line arguments (not described here),
2. Configuring MathJax, and
3. Loading the `startup.js` module to process the configuration.

The configuration is the key part, and there are two important steps you need to take for NodeJS projects that are different from browser-based projects.  First, you must tell MathJax that you are using `require` as the mechanism for loading external files, and second, you need to load a non-browser DOM adaptor.  MathJax provides a light-weight DOM implementation (called `lightDOM`) that is sufficient for MathJax's needs without unnecessary overhead, so you probably want to use that.  If you need a more full-featured DOM implementation, you can use another one, such as `jsdom` (MathJax does provide a `jsdom` adaptor).

The MathJax components come in two forms:  their original source code, and webpacked files that combine all the dependencies into one file.  Your node projects can use either form, and if you are debugging components, it is convenient to use the source files so you don't have to do the webpack step each time you make a change.  The example files let you choose which format you want to use via the `--dist` or `--no-dist` options (`--no-dist` is the default, so the source files are used).  This is controlled by setting the `source` array in the code sample below, and by choosing which version of the `startup.js` file to use.

Other than these considerations, the configuration and usage of MathJax in NodeJS should be the same as for in-browser use.

An example of the configuration for the `tex2chtml` example is given below.  The `argv` object contains the command-line arguments and option values:

```
MathJax = {
    loader: {
        paths: {mathjax: 'mathjax3/components/dist'},
        source: (argv.dist ? {} : require('mathjax3/components/src/source.js').source),
        require: require,
        load: ['input/tex-full', 'output/chtml', 'adaptors/liteDOM']
    },
    tex: {packages: argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)},
    chtml: {fontURL: argv.fontURL},
    startup: {
        typeset: false,
        ready: () => {
            MathJax.startup.defaultReady();
            MathJax.tex2chtmlPromise(argv._[0] || '', {
                display: !argv.inline,
                em: argv.em,
                ex: argv.ex,
                cwidth: argv.width
            }).then(node => {
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
            }).catch(err => console.log(err));
        }
    }
}
```

The first configuration block is for the `loader` module.  It sets the `path` to the base MathJax3 component directory, sets the `source` for loading the components (when you are loading source rather than distribution versions), indicates that you are using node's `require` command to load files (you could set this to something else if you wanted to capture MathJax's file load requests), and requests the loading of the `input/tex-full`, `output/chtml`, and the `adaptors/liteDOM` components.

Then the `tex` and `chtml` components are configured.

Finally, the `startup` component is configured.  This turns off the initial typesetting run, since there is no document to process (this is not strictly needed, but prevents unneeded work).  The main item is the `ready()` function.  This is what is performed when MathJax has loaded all the components and is ready to process math.  The function we provide first does the default actions that the startup module would normally do (`MathJax.startup.defaultReady();`), which includes setting up the input and output jax, the DOM adaptor, and the internal MathDocument, as well as creating the methods in the `MathJax` object for typesetting and converting mathematics using the input and output formats you specified.  This makes the `tex2chtmlPromise()` function available that is used next.

We use the `tex2chtmlPromise()` command to convert the `tex2chtml` command's first argument from TeX to HTML, and use the promise-based form so that we can process autoloaded extensions and the `\require` macro.  When the typesetting is finished, we look up the DOM adaptor from the startup module, and either print the CSS needed for the expression, or the serialized HTML for the expression, using the adaptor to obtain the needed data from the internal representation of the HTML elements.

Once the configuration is set, the last thing to do is load the startup component:

    require('mathjax3/components/' + (argv.dist ? 'dist' : 'src/startup') + '/startup.js');

This loads either the distribution or the source version, depending on which was requested by the command-line options.
