# Speech Generation

This example shows how to use MathJax's `semantic-enrich` extension to generate and attach speech strings to MathJax output.

The main steps needed for this are to:

1. Load the `a11y/semantic-enrich` extension,
2. Configure the extension to generate deep or shallow speech strings, and
3. Add a custom `renderAction` to the math document that removes all non-speech attributes added by the enrichment process.

Most of the examples in this directory use the MathJax [components approach](../component) to accomplish this, but the `mml2svg` example uses the [direct approach](../direct) in order to illustrate that as well.

## Component-Based Example

We use the [`tex2chtml`](tex2chtml) code as an example.  The key pieces are the following lines from the configuration:

```js
loader: {
    paths: {
      mathjax: 'mathjax-full/es5'
    },
    load: ['adaptors/liteDOM', 'a11y/semantic-enrich']
},
options: {
    enableAssistiveMml: false,
    sre: {
      speech: argv.speech
    },
    renderActions: require('./action.js').speechAction
},
```

The `loader` section sets up the path to the directory with the MathJax components, which is here relative to the `node_modules` directory and includes the `a11y/semantic-enrich` component in the list to be loaded. Note, that unlike in previous versions of MathJax there is no need to set up the path to speech-rule-engine (SRE) as this is internally handled by MathJax.

The `options` section sets the document options to include the speech level as a `sre` instruction (given by the `--speech` command-line option), and adds a custom `renderAction` to handle the `data-semantic` attributes generated by SRE.  Because this code is used by all the examples in this directory, it is stored in a separate file, [`action.js`](action.js).  It defines a function that removes any attribute that starts with `data-semantic-` except for `data-semantic-speech`, since the semantic enrichment adds lots of data about the structure of the expression in these attributes.  The code is commented, so see that for details.  The `enableAssistiveMml` option is disabled, since the speech string for assistive technology is being included, so there is no need for the assistive MathML. In addition the `--sre` command-line option allows you to pass additional pairs of arguments to SRE, e.g., to change locale, rule set, or rule preference settings.

The rest of the file is the same as the standard `tex2chtml` using components.  The `renderAction` configuration is all that is needed for that action to be taken automatically during the usual typesetting or conversion calls.

## Direct-Import Example

The [`mml2svg`](mml2svg) example uses the [direct import](../direct) approach.  The key additions in this case are

```js
const {EnrichHandler} = require('mathjax-full/js/a11y/semantic-enrich.js');
```

which loads a function used to augment the HTML handler to include the enrichment functions.  It is used in

```js
EnrichHandler(RegisterHTMLHandler(adaptor), new MathML());
```

to modify the handler that is register by `RegisterHTMLHandler()`, creating a new handler that has the enrichment actions included.  You need to provide a MathML input handler so that it can parse the serialized MathML returned by the SRE.

Finally, the lines

```js
const html = MathJax.document('', {
    InputJax: mml,
    OutputJax: svg,
    enrichSpeech: argv.speech,
    renderActions: require('./action.js').speechAction
});
```

set the speech-generation level (`enrichSpeech`) and adds the `renderAction` for removing the unwanted `data-semantic-` attributes.

As above, the rest of the program just uses the standard conversion calls, and the `renderAction` is called automatically at the right time.

